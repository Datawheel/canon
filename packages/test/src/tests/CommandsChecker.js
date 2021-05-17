const CONSTS = require('../utils/consts'),
      Axios = require("axios"),
      Sequelize = require("sequelize"),
      ChildProcess = require('child_process');


class ServicesChecker{

  constructor(ENV_VARS){

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
        cli: "node -v"
      },
      {
        id: "2-npm-version",
        title: "NPM version",
        description: "Check NPM version",
        cli: "npm -v"
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
          error: error?true:false,
          msg:stdout?stdout:stderr
        };
        resolve(result);
      });
    });
  }

  async run(){
    //Response object with deafult PASS and initialized log.
    const response = {
      status: CONSTS.STATUS.PASS,
      log:[`Starting up: ${this.COMMANDS.length} commands to check.`],
      results: []
    };

    let result;
    //Iterate over command
    for (let index = 0; index < this.COMMANDS.length; index++) {
      //The command object
      const command = this.COMMANDS[index];
      //Log
      response.log.push(`Running ${command.id}...`);
      //Execute test function
      result = await this.execShellCommand(command.cli);
      //Add results
      response.results.push({
        id:command.id,
        title:command.title,
        description:command.description,
        result
      });
      //Log
      response.log.push(`Checked ${command.title};`);
    }

    //Last log line
    response.log.push(`Finished.`);

    return response;
  }
}

module.exports = ServicesChecker;
