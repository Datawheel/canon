const Axios = require("axios"),
      CONSTS = require("./../utils/consts"),
      Sequelize = require("sequelize");


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

    this.SERVICES = [
      {
        id: "1-Postgres",
        title: "CMS Postgres database",
        description: "CMS Postgres database check.",
        validate: async() => {
          try {

            const dbConnection = CANON_DB_CONNECTION_STRING ||
              `postgresql://${CANON_DB_USER}:${CANON_DB_PW}@${CANON_DB_HOST}/${CANON_DB_NAME}`;

            const sequelize = new Sequelize(dbConnection, {
              logging: false,
              operatorsAliases: false
            });

            const data = await sequelize.query("SELECT version();");

            return {error: false, msg: data[0] && data[0][0] ? data[0][0] : data};

          }
          catch (error) {
            console.log(error);
            console.log("ERROR postgres", error);
            return {error: true, msg: error.toString()};
          }
        }
      },
      {
        id: "2-Tesseract",
        title: "Tesseract server",
        description: "Check if Tesseract server is up and running.",
        validate: async() => {
          try {
            const cubeUrl = CANON_CMS_CUBES;

            const data = await Axios.get(cubeUrl)
              .then(resp => resp.data);

            return {error: false, msg: data};

          }
          catch (error) {
            console.log(error);
            console.log("ERROR tesseract", error);
            return {error: true, msg: error.toString()};
          }
        }
      }
    ];
  }

  async run() {
    // Response object with deafult PASS and initialized log.
    const response = {
      title: "Services",
      description: "Validate services",
      status: CONSTS.STATUS.PASS,
      log: [`Starting up: ${this.SERVICES.length} services to check.`],
      results: []
    };

    let result;
    // Iterate over services
    for (let index = 0; index < this.SERVICES.length; index++) {
      // The services object
      const service = this.SERVICES[index];
      // Log
      response.log.push(`Checking ${service.id}...`);
      // Execute test function
      result = await service.validate();
      // Assing results
      response.results.push({
        id: service.id,
        title: service.title,
        description: service.description,
        result
      });
      // Log
      response.log.push(`Checked ${service.title}: ${result.error ? CONSTS.STATUS.FAIL : CONSTS.STATUS.PASS}`);
      // Check CONSTS.status. Whole status is FAIL if there is at least one FAIL.
      if (response.status === CONSTS.STATUS.PASS && result.error) response.status = CONSTS.STATUS.FAIL;
    }

    // Last log line
    response.log.push("Finished.");

    return response;
  }
}

module.exports = ServicesChecker;
