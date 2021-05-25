const CONSTS = require("../utils/consts"),
      Axios = require("axios"),
      Sequelize = require("sequelize"),
      ChildProcess = require("child_process");


class ServicesChecker {

  constructor(ENV_VARS) {

    const {
      CANON_CMS_CUBES,
      CANON_DB_USER,
      CANON_DB_PW,
      CANON_DB_NAME,
      CANON_DB_HOST,
      CANON_DB_CONNECTION_STRING
    } = ENV_VARS;

    this.COMMANDS = [
      {
        id: "1-node-version",
        title: "Node version",
        description: "Check Node version",
        cli: "node -v",
        validate: output => {
          const expectedVersion = 12;
          const currentVersion = parseInt(output.split(".")[0].replace("v", ""));
          const invalidVersion = currentVersion < expectedVersion;
          const result = {
            error: invalidVersion,
            msg: `${output} - Expected version ${expectedVersion} or higher.`
          };
          return result;

        }
      },
      {
        id: "2-npm-version",
        title: "NPM version",
        description: "Check NPM version",
        cli: "npm -v",
        validate: output => {
          const expectedVersion = 6;
          const currentVersion = parseInt(output.split(".")[0]);
          const invalidVersion = currentVersion < expectedVersion;
          const result = {
            error: invalidVersion,
            msg: `${output} - Expected version ${expectedVersion} or higher.`
          };
          return result;
        }
      },
      {
        id: "3-npm-oudated",
        title: "NPM oudated",
        description: "Check NPM oudated packages",
        cli: "npm outdated --long --all"
      }
    ];
  }

  execShellCommand(cmd) {
    const exec = ChildProcess.exec;
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        const result = {
          error: error ? true : false,
          msg: stdout ? stdout : stderr
        };
        resolve(result);
      });
    });
  }

  async run() {
    // Response object with deafult PASS and initialized log.
    const response = {
      title: "Commands",
      description: "Run commands in local server",
      status: CONSTS.STATUS.PASS,
      log: [`Starting up: ${this.COMMANDS.length} commands to check.`],
      results: []
    };

    let result;
    // Iterate over command
    for (let index = 0; index < this.COMMANDS.length; index++) {
      // The command object
      const command = this.COMMANDS[index];
      // Log
      response.log.push(`Running ${command.id}...`);
      // Execute test function
      result = await this.execShellCommand(command.cli);

      // If there is no error from CLI pass through command's validate function
      if (!result.error && command.validate) {
        result = command.validate(result.msg);
      }

      // Add results
      response.results.push({
        id: command.id,
        title: command.title,
        description: command.description,
        result
      });
      // Log
      response.log.push(`Checked ${command.title};`);
    }

    // Last log line
    response.log.push("Finished.");

    return response;
  }
}

module.exports = ServicesChecker;
