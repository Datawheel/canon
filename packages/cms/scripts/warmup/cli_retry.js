#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const {Reporter} = require("./common");
const WorkerPool = require("./workerPool");

const workerPath = path.resolve(__dirname, "worker.js");

/**
 * Scans the profiles that errored in a previous warmup.
 *
 * @param {import(".").WarmupCliOptions} options
 */
module.exports = async function(options) {
  let profileErrors = 0;
  let profileFailures = 0;

  const reporter = new Reporter(options.output);
  reporter.printLine();

  const pool = new WorkerPool(workerPath, options.threads, result => {
    if (result.status === "ERROR") profileErrors++;
    if (result.status === "FAILURE") profileFailures++;
    reporter.log(JSON.stringify(result));
    pool.printProgressBar();
  });

  await pool.waitForWorkersReady();

  const inputPath = path.resolve(process.cwd(), options.input);
  reporter.print(`Retrying warming errors from file:\n  ${inputPath}`);
  const readInterface = readline.createInterface({
    crlfDelay: Infinity,
    input: fs.createReadStream(inputPath)
  });

  for await (const line of readInterface) {
    const prevResult = JSON.parse(line);
    if (prevResult.status !== "SUCCESS") {
      pool.queueWork(prevResult.job);
      console.log(prevResult);
    }
  }
  reporter.print(`Parsed ${pool.jobsTotal} lines.`);

  reporter.print("Waiting for results...");
  const results = await pool.waitForResults();
  await reporter.writeReport("retry", results);

  let profileStatus = "";
  if (profileErrors > 0) {
    profileStatus = `with ${profileErrors} errors`;
  }
  if (profileFailures > 0) {
    profileStatus = `${profileStatus ? ", and" : "with"} ${profileFailures} failures`;
  }
  reporter.print(`\nRetry completed ${profileStatus || "without errors"}.`);

  await pool.terminate();
};
