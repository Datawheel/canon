/* eslint-disable no-unused-vars */

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

class Reporter {
  constructor(output) {
    const outputPath = path.resolve(process.cwd(), output);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }
    process.stdout.write(`Logging errors to folder:\n  ${outputPath}\n`);

    const writerPath = path.resolve(outputPath, "results.json");

    this.writer = fs.createWriteStream(writerPath, {flags: "w"});
    this.outputPath = outputPath;
    this.remainingTotalAmount = 0;
    this.remainingStartTime = null;
  }

  /**
   * @param {string} message
   */
  log(message) {
    this.writer.write(`${message}\n`);
  }

  /**
   * @param {string} profile
   * @param {import("./worker_pool").WorkResult[]} results
   * @returns {Promise<void>}
   */
  writeReport(profile, results) {
    const content = transposeResults(results.filter(result => result.status === "FAILURE"));
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
   */
  printLine(char = "-") {
    const widthSpace = process.stdout.columns * 1 || 80;
    const line = new Array(widthSpace).fill(char).join("").slice(0, widthSpace);
    process.stdout.write(`${line}\n`);
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
       * @type {(value: T) => T | PromiseLike<T>}
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
 * Creates a new sequelize connection, and imports the needed models into it.
 *
 * @param {import(".").WarmupCliOptions} options
 * @param {import("./reporter").Reporter} reporter
 */
async function hydrateModels(options, reporter) {
  let step;

  const dbConnection = options.db ||
    `postgresql://${options["db-user"]}:${options["db-pass"]}@${options["db-host"]}/${options["db-name"]}`;
  reporter.print(`Database Connection: ${dbConnection}`);

  step = reporter.step("Creating new sequelize instance");
  const sequelize = new Sequelize(dbConnection, {
    logging: false,
    operatorsAliases: false
  });
  step.resolve();

  step = reporter.step("Testing connection");
  await sequelize.authenticate().then(step.resolve, step.reject);

  step = reporter.step("Retrieving database models");
  const {modelPaths} = require("../../models");
  const ProfileMeta = sequelize.import(modelPaths.profile_meta);
  const Search = sequelize.import(modelPaths.search);
  const SearchContent = sequelize.import(modelPaths.search_content);
  step.resolve();

  Search.hasMany(SearchContent, {
    foreignKey: "id",
    sourceKey: "contentId",
    as: "contents"
  });

  return {ProfileMeta, Search, SearchContent};
}

/**
 * @param {WorkResultData} results
 */
function transposeResults(results) {
  const selectors = new Map([["", [""].slice(0, 0)]]);
  selectors.clear();

  const getReference = key => {
    const value = selectors.get(key);
    if (value !== undefined) return value;
    const defaultValue = [];
    selectors.set(key, defaultValue);
    return defaultValue;
  };

  for (const result of results) {
    for (const selector of result.data.test_na) {
      getReference(selector).push(result.data.url);
    }
  }

  return JSON.stringify([...selectors.entries()], null, 2);
}

module.exports = {
  Reporter,
  hydrateModels,
  transposeResults
};
