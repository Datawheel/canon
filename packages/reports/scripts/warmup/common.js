/* eslint-disable no-unused-vars */

const fs = require("fs");
const path = require("path");

class Reporter {

  /** @type {number} */
  errorCount;

  /** @type {WorkReport[]} */
  failures;

  /** @type {string} */
  outputPath;

  /** @type {number} */
  successCount;

  /** @type {fs.WriteStream} */
  writer;

  constructor(output) {
    this.resetCounters();
    output && this.setOutput(output);
  }

  setOutput(output) {
    const outputPath = path.resolve(process.cwd(), output);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }
    process.stdout.write(`Reports will be saved on:\n  ${outputPath}\n`);
    this.outputPath = outputPath;

    const writerPath = path.resolve(outputPath, "results.json");
    this.writer = fs.createWriteStream(writerPath, {flags: "w"});
  }

  /**
   * @param {string} message
   */
  log(message) {
    this.writer.write(`${message}\n`);
  }

  /**
   * @param {string} profile
   * @returns {Promise<void>}
   */
  writeReport(profile) {
    const content = transposeResults(this.failures);
    const reportPath = path.resolve(this.outputPath, `profile_${profile}.json`);
    return fs.promises.writeFile(reportPath, content);
  }

  /**
   * @param {string} message
   * @param {boolean} [lineBreak]
   */
  print(message, lineBreak = true) {
    process.stdout.write(`${message}${lineBreak ? "\n" : ""}`);
  }

  /**
   * @param {string} char
   */
  printLine(char = "-") {
    const widthSpace = process.stdout.columns * 1 || 80;
    const line = new Array(widthSpace).fill(char).join("").slice(0, widthSpace);
    process.stdout.write(`${line}\n`);
  }

  /**
   * @param {WorkReport} report
   */
  countResult(report) {
    report.status === "ERROR" && this.errorCount++;
    report.status === "SUCCESS" && this.successCount++;
    report.status === "FAILURE" && this.failures.push(report);
  }

  resetCounters() {
    this.errorCount = 0;
    this.failures = [];
    this.successCount = 0;
  }

  /**
   * @param {string} profile
   */
  printCount(profile) {
    let profileStatus = "";
    if (this.errorCount > 0) {
      profileStatus = `with ${this.errorCount} errors`;
    }
    if (this.failures.length > 0) {
      profileStatus = `${profileStatus ? ", and" : "with"} ${this.failures.length} failures`;
    }
    this.print(`\nProfile "${profile}" completed ${profileStatus || "without errors"}.`);
  }

  /**
   * @param {string} message
   */
  step(message) {
    process.stdout.write(`WAIT: ${message}...`);
    return {
      reject(error) {
        process.stdout.write("\r\x1b[K");
        process.stdout.write(`ERR : ${message}\n`);
        throw error;
      },

      /**
       * @template T
       * @type {(value: T) => T}
       */
      resolve(value) {
        process.stdout.write("\r\x1b[K");
        process.stdout.write(`OK  : ${message}\n`);
        return value;
      }
    };
  }
}

/**
 * @param {WorkReport[]} reports
 */
function transposeResults(reports) {
  const selectors = new Map([["", [""].slice(0, 0)]]);
  selectors.clear();

  const getReference = key => {
    const value = selectors.get(key);
    if (value !== undefined) return value;
    const defaultValue = [];
    selectors.set(key, defaultValue);
    return defaultValue;
  };

  for (const report of reports) {
    const {test_na} = report.result;

    if (test_na && test_na.length > 0) {
      const {url} = report.job;
      for (const selector of test_na) {
        getReference(selector).push(url);
      }
    }
  }

  return JSON.stringify([...selectors.entries()], null, 2);
}

/**
 * @param {string[]} rawHeaders
 * @returns {Record<string, string>}
 */
function parseHeaders(rawHeaders) {
  return [].concat(rawHeaders).reduce((headers, combo) => {
    const splitIndex = combo.indexOf(":");
    const key = combo.substr(0, splitIndex).trim();
    headers[key] = combo.substr(splitIndex + 1).trim();
    return headers;
  }, {});
}

module.exports = {
  Reporter,
  parseHeaders,
  transposeResults
};

/**
 * @typedef WorkReport
 * @prop {string} [error]
 * @prop {Record<string, string>} job
 * @prop {any} [result]
 * @prop {"SUCCESS" | "FAILURE" | "ERROR"} status
 */
