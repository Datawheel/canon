const coreTables = require("@datawheel/canon-core/models");
const cmsTables = require("@datawheel/canon-cms/models");
// const passportTables = require("@datawheel/canon-passport/db");
const testTable = require("./db/testTable");

const {env} = process;

module.exports = {
  express: {
    bodyParser: {
      json: {
        verify: (req, red, buf) => {
          const url = req.originalUrl;
          console.log("verify", url);
          if (url.startsWith("/api/raw")) {
            req.rawBody = buf.toString();
          }
        }
      }
    }
  },
  db: [
    {
      host: env.CANON_CMS_DBHOST || "localhost",
      name: env.CANON_CMS_DBNAME,
      user: env.CANON_CMS_DBUSER,
      pass: env.CANON_CMS_DBPASS,
      tables: Object.values(cmsTables)
    },
    // {
    //   connection: `postgresql://${env.CANON_DB_NAME}:${env.CANON_DB_PASS}@${env.CANON_DB_HOST || "localhost"}:${env.CANON_DB_PORT || 5432}/${env.CANON_DB_NAME}`,
    //   tables: Object.values(passportTables)
    // },
    {
      connection: env.CANON_SERVER_DBCONNECTION,
      tables: [].concat(
        Object.values(coreTables),
        testTable
      )
    }
  ]
};
