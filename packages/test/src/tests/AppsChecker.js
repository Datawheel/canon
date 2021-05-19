const CONSTS = require('./../utils/consts'),
      Axios = require("axios"),
      Sequelize = require("sequelize");


class AppsChecker{

  constructor(ENV_VARS){

    const {
      CANON_API
    } = ENV_VARS;

    this.APPS = [
      {
        id: "1-Canon-core",
        title: "Canon Core",
        description: "Check Canon Core status endpoint.",
        validate: async ()=>{
          try {
            const cubeUrl = `${CANON_API}/api/status/core`;

            const data = await Axios.get(cubeUrl)
              .then(resp => resp.data);

            return {error: data.error, msg: data};

          } catch (error) {
            console.log(error);
            console.log('ERROR Canon core', error);
            return {error: true, msg: error.toString()};
          }
        }
      },
      {
        id: "2-Canon-cms",
        title: "Canon CMS",
        description: "Check Canon CMS status endpoint.",
        validate: async ()=>{
          try {
            const cubeUrl = `${CANON_API}/api/status/cms`;

            const data = await Axios.get(cubeUrl)
              .then(resp => resp.data);

            return {error: data.error, msg: data};

          } catch (error) {
            console.log(error);
            console.log('ERROR Canon core', error);
            return {error: true, msg: error.toString()};
          }
        }
      }
    ];
  }

  async run(){
    //Response object with deafult PASS and initialized log.
    const response = {
      status: CONSTS.STATUS.PASS,
      log:[`Starting up: ${this.APPS.length} apps to check.`],
      results: []
    };

    let result;
    //Iterate over services
    for (let index = 0; index < this.APPS.length; index++) {
      //The services object
      const app = this.APPS[index];
      //Log
      response.log.push(`Checking ${app.id}...`);
      //Execute test function
      result = await app.validate();
      //Assing results
      response.results.push({
        id:app.id,
        title:app.title,
        description:app.description,
        result
      });
      //Log
      response.log.push(`Checked ${app.title}: ${result.error?CONSTS.STATUS.FAIL:CONSTS.STATUS.PASS}`);
      //Check CONSTS.status. Whole status is FAIL if there is at least one FAIL.
      if (response.status === CONSTS.STATUS.PASS && result.error) response.status = CONSTS.STATUS.FAIL;
    }

    //Last log line
    response.log.push(`Finished.`);

    return response;
  }
}

module.exports = AppsChecker;
