// Imports
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const {Liquid} = require("liquidjs");

// Import checkers
const CommandsChecker = require("./tests/CommandsChecker");
const ServicesChecker = require("./tests/ServicesChecker");
const AppsChecker = require("./tests/AppsChecker");

// Env Vars
const ENV_VARS = process.env;

// Setup server app
const app = express();

// Create template engine
const engine = new Liquid({
  root: __dirname, // for layouts and partials
  extname: ".liquid",
  trimOutputLeft: true,
  trimOutputRight: true,
  trimTagLeft: true,
  trimTagRight: true
});

const templatesDir = `${__dirname}/templates`;
const publicDir = `${__dirname}/public`;

// Set the express middlewares
app.use(express.static(publicDir));
app.use(cors());
app.use(compression());

// Register liquid engine
app.engine("liquid", engine.express());
// Specify the views directories
app.set("views", [`${templatesDir}/views`, `${templatesDir}/partials`]);
// Set liquid to default view engine
app.set("view engine", "liquid");

// Define the home route
app.get("/", async(req, res) => {

  // Format
  let format = (req.query.format || "html").toLocaleLowerCase();
  format = ["json", "html"].indexOf(format) > -1 ? format : "html";

  const results = await getCheckersResponse();

  if (format === "json") {
    // Send JSON response
    res.send(results).end();
  }
  else {
    // Send HTML response
    res.render("results", {
      results: Object.values(results),
      title: "Integration tests results"
    });
  }
});

// Initialize Checkers
const services = new ServicesChecker(ENV_VARS);
const commands = new CommandsChecker(ENV_VARS);
const apps =     new AppsChecker(ENV_VARS);

const getCheckersResponse = async() => ({
  apps: await apps.run(),
  services: await services.run(),
  commands: await commands.run()
});

module.exports = app;
