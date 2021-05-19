// Imports
const express = require("express");
const compression = require("compression");
const cors = require("cors");

// Import checkers
const CommandsChecker = require("./tests/CommandsChecker");
const ServicesChecker = require("./tests/ServicesChecker");
const AppsChecker = require("./tests/AppsChecker");

// Env Vars
const ENV_VARS = process.env;

// Setup server app
const app = express();

// Set the express middlewares
app.use(express.static("public"));
app.use(cors());
app.use(compression());

// Define the home route
app.get("/", (req, res) => {
  res.send("<h1>Canon Test!</h1>");
});

// Initialize Checkers
const services = new ServicesChecker(ENV_VARS);
const commands = new CommandsChecker(ENV_VARS);
const apps =     new AppsChecker(ENV_VARS);

// Run basic stats about the cache
app.get("/status", async(req, res) => {

  // Response object with deafult PASS.
  const response = {
    services: await services.run(),
    commands: await commands.run(),
    apps: await apps.run()
  };

  // Send response
  res.send(response).end();

});

const port = process.env.CANON_TEST_PORT || 3000;

// Start the server listening for requests
app.listen(port,
  () => console.log(`[canon-test] Canon-test server is running in port ${port}`));
