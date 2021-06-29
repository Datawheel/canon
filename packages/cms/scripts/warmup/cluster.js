#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const {Cluster} = require("puppeteer-cluster");
const {Reporter, parseHeaders} = require("./common");
const {hydrateModels} = require("./database");
const {naTestHandler} = require("./test_na");

const reporter = new Reporter();

/**
 * Scans the available profiles on the app CMS instance.
 *
 * @param {import(".").WarmupCliOptions} options
 */
module.exports = async function(options) {
  reporter.setOutput(options.output);
  reporter.printLine();

  const credentials = options.username && options.password
    ? {username: options.username, password: options.password}
    : undefined;
  const headers = parseHeaders(options.header);
  const maxTimeoutPerPage = parseInt(options.timeout, 10) * 1000;

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: parseInt(options.workers, 10),
    monitor: true,
    timeout: maxTimeoutPerPage
  });

  cluster.on("taskerror", (error, job) => {
    const report = {status: "ERROR", error: error.message, job};
    reporter.countResult(report);
    reporter.log(JSON.stringify(report));
  });

  await cluster.task(async params => {
    const {page, data: job} = params;

    await page.setDefaultNavigationTimeout(maxTimeoutPerPage);
    await page.setExtraHTTPHeaders(headers);
    await page.setViewport({width: 1280, height: 720});

    credentials && await page.authenticate(credentials);

    await page.goto(job.url, {waitUntil: "load", timeout: maxTimeoutPerPage});

    // Wait for the Profile to load completely
    await page.waitForSelector("#Profile", {timeout: maxTimeoutPerPage});

    // Look for N/A in the content
    const report = await naTestHandler(page).then(result => {
      const status = result.length === 0 ? "SUCCESS" : "FAILURE";
      return {status, result: {test_na: result}, job};
    }, error => ({status: "ERROR", error: error.message, job}));

    reporter.countResult(report);
    if (report.status !== "SUCCESS") {
      reporter.log(JSON.stringify(report));
    }
  });

  if (options.input) {
    await executeFromNdjson(options, cluster);
  }
  else {
    await executeFromDatabase(options, cluster);
  }

  await cluster.close();
};

/** */
async function executeFromDatabase(options, cluster) {
  const urlTemplate = options.base || "";

  const {ProfileMeta, Search} = await hydrateModels(options, reporter);

  const profileList = `${options.profile}`.split(",").filter(slug => slug.trim());
  const profiles = await ProfileMeta.findAllIn(profileList);

  for (const profile of profiles) {
    reporter.printLine();
    reporter.print(`Starting scan of profile "${profile.slug}"`);

    const pages = await Search.findAllFromProfile(profile);

    for (const page of pages) {
      const jobParams = {
        locale: options.locale,
        page: page.slug,
        profile: profile.slug
      };
      jobParams.url = urlTemplate.replace(/:(\w+)\b/g, (_, key) => jobParams[key]);
      cluster.queue(jobParams);
    }

    await cluster.idle();

    reporter.writeReport(profile.slug);
    reporter.printCount(profile.slug);
    reporter.resetCounters();
  }
}

/** */
async function executeFromNdjson(options, cluster) {
  const urlTemplate = options.base || "";

  const inputPath = path.resolve(process.cwd(), options.input);
  reporter.print(`Retrying warming errors from file:\n  ${inputPath}`);

  const readInterface = readline.createInterface({
    crlfDelay: Infinity,
    input: fs.createReadStream(inputPath)
  });

  for await (const line of readInterface) {
    const prevResult = JSON.parse(line);
    if (prevResult.status === "SUCCESS") continue;

    const jobParams = prevResult.job;
    jobParams.url = urlTemplate.replace(/:(\w+)\b/g, (_, key) => jobParams[key]);
    cluster.queue(jobParams);
  }

  await cluster.idle();

  reporter.writeReport("retry");
  reporter.printCount("retry");
  reporter.resetCounters();
}
