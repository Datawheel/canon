module.exports = {
  name: "domain",

  lookup(req) {

    let found;

    if (typeof req !== "undefined" && req.headers.host.indexOf(".") > 0) {
      found = req.headers.host.split(".")[0];
    }

    return found;
  }

};
