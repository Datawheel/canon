const axios = require("axios");
const Sequelize = require("sequelize");

const {
  CANON_CMS_CUBES,
  CANON_DB_USER,
  CANON_DB_PW,
  CANON_DB_NAME,
  CANON_DB_HOST,
  CANON_DB_CONNECTION_STRING
} = process.env;

const STATUS = {
  FAIL:"[FAILED]",
  PASS:"[PASS]"
};

module.exports = function(app) {

  const {db} = app.settings;

  const SERVICES = [
    {
      id: "1-Postgres",
      testFn: async ()=>{
        try {

          const dbConnection = CANON_DB_CONNECTION_STRING ||
            `postgresql://${CANON_DB_USER}:${CANON_DB_PW}@${CANON_DB_HOST}/${CANON_DB_NAME}`;

          const sequelize = new Sequelize(dbConnection, {
            logging: false,
            operatorsAliases: false
          });

          const data = await sequelize.query("SELECT version();");

          return {error: false, msg: data[0] && data[0][0]?data[0][0]:data};

        } catch (error) {
          console.log(error);
          console.log('ERROR postgres', error);
          return {error: true, msg: error.toString()};
        }
      }
    },
    {
      id: "2-Tesseract",
      testFn: async ()=>{
        try {
          const cubeUrl = CANON_CMS_CUBES;

          const data = await axios.get(cubeUrl)
            .then(resp => resp.data);

          return {error: false, msg: data};

        } catch (error) {
          console.log(error);
          console.log('ERROR tesseract', error);
          return {error: true, msg: error.toString()};
        }
      }
    }
  ];

  app.get("/api/status", async(req, res) => {

    //Response object with deafult PASS and initialized log.
    const response = {
      status: STATUS.PASS,
      log:[`Starting up: ${SERVICES.length} services to check.`],
      services: {}
    };

    let result;
    //Iterate over services
    for (let index = 0; index < SERVICES.length; index++) {
      //The services object
      const service = SERVICES[index];
      //Log
      response.log.push(`Checking ${service.id}...`);
      //Execute test function
      result = await service.testFn();
      //Assing results to last
      response.services[service.id] = result;
      //Log
      response.log.push(`Checked ${service.id}: ${result.error?STATUS.FAIL:STATUS.PASS}`);
      //Check status. Whole status is FAIL if there is at least one FAIL.
      if (response.status === STATUS.PASS && result.error) response.status = STATUS.FAIL;
    }

    //Last log line
    response.log.push(`Finished.`);

    //Send response
    res.send(response).end();

  });

};
