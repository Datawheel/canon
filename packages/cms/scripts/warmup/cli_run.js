#!/usr/bin/env node

const path = require("path");
const Sequelize = require("sequelize");
const {Reporter, hydrateModels} = require("./common");
const WorkerPool = require("./workerpool");

const workerPath = path.resolve(__dirname, "worker.js");

/**
 * Scans the available profiles on the app CMS instance.
 *
 * @param {import(".").WarmupCliOptions} options
 */
module.exports = async function(options) {
  const {Op} = Sequelize;
  let step;
  let errorCount = 0;
  let failureCount = 0;

  const reporter = new Reporter(options.output);
  reporter.printLine();

  reporter.print("Hydrating database");
  const {ProfileMeta, Search} = await hydrateModels(options, reporter);

  const limitedProfiles = `${options.profile}`.split(",").filter(slug => slug.trim());

  step = reporter.step("Requesting configured profiles");
  let profiles = await ProfileMeta.findAll({
    where: {
      slug: limitedProfiles.length > 0
        ? {[Op.in]: limitedProfiles}
        : {[Op.ne]: ""},
      dimension: {[Op.ne]: ""},
      [Op.and]: Sequelize.where(
        Sequelize.fn("array_length", Sequelize.col("levels"), 1),
        {[Op.gt]: 0}
      ),
      measure: {[Op.ne]: ""},
      cubeName: {[Op.ne]: ""}
    }
  }).then(step.resolve, step.reject);

  if (limitedProfiles.length > 0) {
    reporter.print(`User requested for profiles: ${limitedProfiles.join(", ")}`);
    profiles = profiles.sort((a, b) => limitedProfiles.indexOf(a.slug) - limitedProfiles.indexOf(b.slug));
  }
  reporter.print(`Profiles found: ${profiles.map(p => p.slug).join(", ")}`);

  for (const profile of profiles) {
    let profileErrors = 0;
    let profileFailures = 0;

    reporter.printLine();
    reporter.print(`Starting scan of profile "${profile.slug}"`);

    const pool = new WorkerPool(workerPath, options.threads, result => {
      if (result.status === "ERROR") profileErrors++;
      if (result.status === "FAILURE") profileFailures++;
      reporter.log(JSON.stringify(result));
      pool.printProgressBar();
    });

    step = reporter.step("Requesting saved pages on this profile");
    const pages = await Search.findAll({
      where: {
        dimension: profile.dimension,
        cubeName: profile.cubeName
      },
      order: [
        ["zvalue", "DESC"],
        ["cubeName", "DESC"],
        ["dimension", "DESC"],
        ["hierarchy", "DESC"],
        ["slug", "DESC"]
      ]
    }).then(step.resolve, step.reject);

    reporter.print(`Obtained ${pages.length} pages.`);

    const headers = [].concat(options.header).reduce((headers, combo) => {
      const splitIndex = combo.indexOf(":");
      const key = combo.substr(0, splitIndex).trim();
      headers[key] = combo.substr(splitIndex + 1).trim();
      return headers;
    }, {});

    await pool.waitForWorkersReady();

    let n = pages.length;
    while (n--) {
      const page = pages[n];
      pool.queueWork({
        baseURL: options.base || "",
        headers,
        locale: options.locale,
        maxTimeoutPerPage: options.maxTimeoutPerPage || 15000,
        networkIdleLevel: options.networkIdleLevel || 0,
        page: page.slug,
        password: options.password,
        profile: profile.slug,
        username: options.username
      });
    }

    reporter.print("Waiting for results", false);
    const results = await pool.waitForResults();
    await reporter.writeReport(profile.slug, results);

    let profileStatus = "";
    if (profileErrors > 0) {
      errorCount += profileErrors;
      profileStatus = `with ${profileErrors} errors`;
    }
    if (profileFailures > 0) {
      failureCount += profileFailures;
      profileStatus = `${profileStatus ? ", and" : "with"} ${profileFailures} failures`;
    }
    reporter.print(`\nProfile "${profile.slug}" completed ${profileStatus || "without errors"}.`);

    await pool.terminate();
  }

  reporter.printLine();
  reporter.print(`Warming script finished with ${errorCount} errors and ${failureCount} failures.`);
};
