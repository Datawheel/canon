const axios = require("axios");

module.exports = function() {

  return axios.get("https://datausa.io/api/data?measures=Population&drilldowns=State&year=latest")
    .then(d => d.data);

};
