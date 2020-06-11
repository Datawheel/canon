const axios = require("axios");

module.exports = function() {

  return axios.get("https://api.dataafrica.io/attrs/geo/")
    .then(d => d.data);

};
