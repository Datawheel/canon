const {env} = process;
const {timeFormat} = require("d3-time-format");
const formatTime = timeFormat("%B %-d, %Y");
const path = require("path");
const fs = require("fs");
const imagePath = path.resolve("static/images/pdf-header.png");
const buffer = fs.readFileSync(imagePath, {encoding: "base64"});
const pdfHeader = `data:image/png;base64,${buffer}`;


/** @type {import("@datawheel/canon-core").Config} */
module.exports = {
  sitemap: {
    paths: {
      profiles: "/:lang/profile/:profile/:page",
      stories: "/:lang/story/:page"
    },
    rss: {
      blogName: "My Datawheel blog",
      blogDescription: "It is a fantastic blog based on data."
    },
    getMainPaths: asyncapp =>
      // You can run queries in here and return an array of paths
      [
        "/",
        "/about",
        "/about/data",
        "/blog/es/super-post",
        "/blog/en/super-posteo"
      ]

  },
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
    },
    set: {
      "trust proxy": true
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
  ],
  pdf: {
    pdfOptions: {
      headerTemplate: `<div style="width: 100%;">
        <img src="${pdfHeader}" width="100%" />
      </div>`,
      footerTemplate: `
      <style>
        .container {
          background-color: #e5e5e5;
          color: #000;
          display: block;
          font-family: 'Open Sans', 'Trebuchet MS', sans-serif;
          font-size: 12px;
          padding: 10px;
          text-align: center;
          width: 100%;
          -webkit-print-color-adjust: exact;
        }
        .pageNumber,
        .totalPages {
          font-size: 12px;
        }
        .url, .subtitle {
          font-size: 10px;
        }
      </style>
      <div className="container">
        Page <span className="pageNumber"></span> of <span className="totalPages"></span>
        <div className="url"></div>
        <div className="subtitle">Generated on ${formatTime(new Date())}</div>
      </div>`,
      margin: {bottom: 120, top: 170}
    },
    viewportOptions: {
      deviceScaleFactor: 2
    }
  }
};
