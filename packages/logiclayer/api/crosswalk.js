const fs = require("fs"),
      path = require("path");

/** */
function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, filename), "utf8"));
}

const napcs2sctg = loadJSON("../static/data/nacps2sctg.json");

module.exports = function(app) {

  app.get("/api/cip/parent/:id/:level", (req, res) => {

    const {id, level} = req.params;
    const depth = parseInt(level.slice(3), 10);
    const parentId = id.slice(0, depth);
    res.json({id: parentId});

  });

  app.get("/api/napcs/:id/sctg", (req, res) => {

    const ids = napcs2sctg[req.params.id] || [];
    res.json(ids.map(id => ({id})));

  });

};
