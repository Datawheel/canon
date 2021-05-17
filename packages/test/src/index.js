// Imports
const express = require("express");
const compression = require('compression')
const cors = require('cors');
const CONSTS = require('./utils/consts')

// Import checkers
const CommandsChecker = require('./tests/CommandsChecker')
const ServicesChecker = require('./tests/ServicesChecker')

//Env Vars
const ENV_VARS = process.env;

// Setup server app
const app = express();

// Set the express middlewares
app.use(express.static("public"));
app.use(cors());
app.use(compression());

// Define the home route
app.get("/", function (req, res) {
  res.send("<h1>Canon Checker!</h1>")
});

//Initialize Checkers
const services = new ServicesChecker(ENV_VARS);
const commands = new CommandsChecker(ENV_VARS);

//Run basic stats about the cache
app.get("/status", async (req, res) => {

  //Response object with deafult PASS.
  const response = {
    services: await services.run(),
    commands: await commands.run()
  };

  //Send response
  res.send(response).end();

})

// Start the server listening for requests
app.listen(process.env.PORT || 3000,
	() => console.log("Canon-Checker server is running..."));
