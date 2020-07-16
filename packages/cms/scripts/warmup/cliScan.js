#!/usr/bin/env node

const {Worker} = require("worker_threads");
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
  const {ne, and, gt} = Sequelize.Op;

  const {ProfileMeta, Search} = await hydrateModels();

  log.write("Requesting configured profiles...");
  const profiles = await ProfileMeta.findAll({
    where: {
      slug: {[ne]: ""},
      dimension: {[ne]: ""},
      [and]: Sequelize.where(Sequelize.fn("array_length", Sequelize.col("levels"), 1), {[gt]: 0}),
      measure: {[ne]: ""},
      cubeName: {[ne]: ""}
    }
  });
  log.overwrite(`Obtained ${profiles.length} profiles.`);

  const workerPath = path.resolve(__dirname, "request.js");
  const pool = new WorkerPool(workerPath, options.threads);
  pool.on("progress", work => {
    log.write(work.url);
  });

  for (const profile of profiles) {
    log.write(`\nStarting scan of profile "${profile.slug}"...`);

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
    log.overwrite(`Obtained ${pages.length} pages.\n`);

    let n = pages.length;
    while (n--) {
      const page = pages[n];
      pool.queueWork({
        auth: options.user && options.pass
          ? {username: options.user, password: options.pass}
          : undefined,
        method: "GET",
        url: `${options.base}`
          .replace(/:profile\b/g, profile.slug)
          .replace(/:page\b/g, page.slug)
      });
    }

    const results = await pool.waitForResults();
    const errors = results.filter(result => result.status === "ERROR");
    console.log(`Registered ${errors.length} errors.`);
  }

  console.log("success!");
};
