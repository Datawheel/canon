const url = require("url");

module.exports = {
  name: "query",

  lookup(req) {

    let found;

    if (typeof req !== "undefined") {
      const query = req.query || url.parse(req.url, true).query;
      found = query.lang || query.language || query.locale || query.lng;
    }

    return found;
  }

};
