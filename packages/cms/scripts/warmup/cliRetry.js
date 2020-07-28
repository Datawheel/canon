#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const log = require("./logger");
const WorkerPool = require("./workerPool");

/**
 * Scans the profiles that errored in a previous warmup.
 *
 * @param {import(".").WarmupCliOptions} options
 */
module.exports = async function(options) {
  const inputPath = path.resolve(process.cwd(), options.input);
  log.write(`Retrying warming errors from file: ${inputPath}`);

  let logStream;
  if (options.output) {
    const outputPath = path.resolve(process.cwd(), options.output);
    log.write(`Logging errors to file: ${outputPath}`);
    logStream = fs.createWriteStream(outputPath, {flags: "w"});
  }

  const widthSpace = process.stdout.columns * 1 || 80;
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

  const workerPath = path.resolve(__dirname, "request.js");
  const pool = new WorkerPool(workerPath, options.threads, progressCallback);

  const readInterface = readline.createInterface({
    crlfDelay: Infinity,
    input: fs.createReadStream(inputPath)
  });

  for await (const line of readInterface) {
    const prevResult = JSON.parse(line);
    pool.queueWork(prevResult.workData);
  }
  log.write(`Parsed ${pool.totalWorks} lines.\n\nWaiting for results...`);

  const results = await pool.waitForResults();

  const failures = results.filter(result => result.status === "ERROR");
  if (failures.length > 0) {
    log.write(`\nRetry completed with ${failures.length} errors.`);
  }
  else {
    log.write("\nRetry completed without errors.");
  }

  logStream && logStream.end();
  await pool.terminate();
};
