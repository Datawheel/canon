#!/usr/bin/env node

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

  const limitedProfiles = `${options.profile}`.split(",");

  log.write("Requesting configured profiles...");
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
  });
  log.overwrite("Requesting configured profiles... SUCCESS\n");

  if (limitedProfiles.length > 0) {
    log.write(`User requested for profiles: ${limitedProfiles.join(", ")}`);
    profiles = profiles.sort((a, b) => limitedProfiles.indexOf(a.slug) - limitedProfiles.indexOf(b.slug));
  }
  log.write(`Profiles found: ${profiles.map(p => p.slug).join(", ")}`);

  const workerPath = path.resolve(__dirname, "request.js");
  const pool = new WorkerPool(workerPath, options.threads);

  for (const profile of profiles) {
    log.write(`\nStarting scan of profile "${profile.slug}"`);

    log.write("Requesting saved pages on this profile...");
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
    });
    log.overwrite("Requesting saved pages on this profile... SUCCESS");
    log.write(`Obtained ${pages.length} pages.\n`);

    let n = pages.length;
    while (n--) {
      const page = pages[n];
      pool.queueWork({
        auth: options.username && options.password
          ? {username: options.username, password: options.password}
          : undefined,
        method: "GET",
        url: `${options.base}`
          .replace(/:profile\b/g, profile.slug)
          .replace(/:page\b/g, page.slug)
      });
    }

    const progressLogger = () => {
      const progress = Math.floor(pool.results.length / pool.totalWorks * 100);
      const bar = "".concat(
        new Array(Math.floor(progress / 2) + 1).join("#"),
        new Array(51).join(" ")
      );
      const worksLength = `${pool.totalWorks}`.length * 2 + 1;
      const works = `${new Array(worksLength).join(" ")}${pool.results.length}/${pool.totalWorks}`;
      log.overwrite(`${works.substr(-1 * worksLength)} [${bar.substr(0, 50)}] ${progress}%`);
    };

    pool.on("progress", progressLogger);
    log.write("Waiting for results...");
    const results = await pool.waitForResults();
    pool.off("progress", progressLogger);

    const errors = results.filter(result => result.status === "ERROR");
    errorCount += errors.length;
    log.write(`\nRegistered ${errors.length} errors.`);
  }

  log.write(`\nWarming script finished with ${errorCount} errors.`);
};
