const {env} = process;

/** @type {import("@datawheel/canon-core").Config} */
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
    // {
    //   connection: env.CANON_SERVER_DBCONNECTION ||
    //     `postgresql://${env.CANON_DB_USER}:${env.CANON_DB_PASS}@${env.CANON_DB_HOST || "localhost"}:${env.CANON_DB_PORT || 5432}/${env.CANON_DB_NAME}`,
    //   tables: [
    //     coreModelPaths.users,
    //     require("./db/testTable")
    //   ]
    // },
    {
      host: env.CANON_DB_HOST || "localhost",
      name: env.CANON_DB_NAME,
      user: env.CANON_DB_USER,
      pass: env.CANON_DB_PW,
      tables: [
        require("@datawheel/canon-cms/models"),
        require("@datawheel/canon-core/models")
      ]
    }
  ]
};
