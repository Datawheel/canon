#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const Sequelize = require("sequelize");

const log = require("./logger");
const hydrateModels = require("./models");
const WorkerPool = require("./workerPool");

/**
 * Scans the available profiles on the app CMS instance.
 *
 * @param {import(".").WarmupCliOptions} options
 */
module.exports = async function(options) {
  let errorCount = 0;
  const {Op} = Sequelize;

  const {ProfileMeta, Search} = await hydrateModels(options);

  const limitedProfiles = `${options.profile}`.split(",").filter(slug => slug.trim());

  let logStream;
  if (options.output) {
    const outputPath = path.resolve(process.cwd(), options.output);
    log.write(`Logging errors to file: ${outputPath}`);
    logStream = fs.createWriteStream(outputPath, {flags: "w"});
  }

  log.write("Requesting configured profiles...");
  let profiles = await ProfileMeta.findAll({
    where: {
      cubeName: {[Op.ne]: ""},
      dimension: {[Op.ne]: ""},
      [Op.and]: Sequelize.where(
        Sequelize.fn("array_length", Sequelize.col("levels"), 1),
        {[Op.gt]: 0}
      ),
      measure: {[Op.ne]: ""},
      slug: limitedProfiles.length > 0
        ? {[Op.in]: limitedProfiles}
        : {[Op.ne]: ""},
      visible: true
    }
  });
  log.overwrite("Requesting configured profiles... SUCCESS\n");

  if (limitedProfiles.length > 0) {
    log.write(`User requested for profiles: ${limitedProfiles.join(", ")}`);
    profiles = profiles.sort((a, b) => limitedProfiles.indexOf(a.slug) - limitedProfiles.indexOf(b.slug));
  }
  log.write(`Profiles found: ${profiles.map(p => p.slug).join(", ")}`);

  const workerPath = path.resolve(__dirname, "request.js");
  const widthSpace = process.stdout.columns * 1 || 80;

  for (const profile of profiles) {
    log.write(`\nStarting scan of profile "${profile.slug}"`);

    const progressCallback = (error, workData) => {
      if (logStream && error) {
        logStream.write(`${JSON.stringify({error: error.message, workData})}\n`);
      }
      const worksTotal = pool.totalWorks;
      const worksSuc = pool.results.filter(w => w.status === "SUCCESS").length;
      const progress = pool.results.length / worksTotal;

      const numLength = `${worksTotal}`.length;
      const spaceBar = new Array(numLength + 1).join(" ");
      const labels = Object.entries({
        T: worksTotal,
        S: worksSuc,
        E: pool.results.length - worksSuc
      }).map(item => `${item[0]}: ${`${spaceBar}${item[1]}`.substr(-1 * numLength)}`)
        .join(" / ");

      const barLength = widthSpace - labels.length - 10;
      const bar = "".concat(
        new Array(Math.floor(barLength * progress) + 1).join("#"),
        new Array(barLength + 1).join(" ")
      );

      log.overwrite(`${labels} [${bar.substr(0, barLength)}] ${Math.floor(progress * 100)}%`);
    };
    const pool = new WorkerPool(workerPath, options.threads, progressCallback);

    log.write("Requesting saved pages on this profile...");
    const pages = await Search.findAll({
      where: {
        cubeName: profile.cubeName,
        dimension: profile.dimension

      },
      order: [
        ["zvalue", "DESC"],
        ["cubeName", "DESC"],
        ["dimension", "DESC"],
        ["hierarchy", "DESC"],
        ["slug", "DESC"]
      ]
    });
    log.overwrite("Requesting saved pages on this profile... SUCCESS");
    log.write(`Obtained ${pages.length} pages.\n`);

    const auth = options.username && options.password
      ? {username: options.username, password: options.password}
      : undefined;

    const headers = [].concat(options.header).reduce((headers, combo) => {
      const splitIndex = combo.indexOf(":");
      const key = combo.substr(0, splitIndex).trim();
      headers[key] = combo.substr(splitIndex + 1).trim();
      return headers;
    }, {});

    let n = pages.length;
    while (n--) {
      const page = pages[n];
      pool.queueWork({
        auth,
        headers,
        method: "GET",
        url: `${options.base}`
          .replace(/:profile\b/g, profile.slug)
          .replace(/:page\b/g, page.slug)
      });
    }

    log.write("Waiting for results...");
    const results = await pool.waitForResults();

    const failures = results.filter(result => result.status === "ERROR");
    if (failures.length > 0) {
      errorCount += failures.length;
      log.write(`\nProfile "${profile.slug}" completed with ${failures.length} errors.`);
    }
    else {
      log.write(`\nProfile "${profile.slug}" completed without errors.`);
    }

    await pool.terminate();
  }

  log.write(`\nWarming script finished with ${errorCount} errors.`);
  logStream && logStream.end();
};
