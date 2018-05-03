const axios = require("axios");

module.exports = function() {

  return axios.get("https://api.datausa.io/attrs/cip/").then(d => d.data);

};
