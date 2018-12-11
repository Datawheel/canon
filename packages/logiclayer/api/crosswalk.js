const axios = require("axios"),
      fs = require("fs"),
      path = require("path");

/** */
function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, filename), "utf8"));
}

const {CANON_LOGICLAYER_CUBE} = process.env;

const napcs2sctg = loadJSON("../static/data/nacps2sctg.json");
const naics2io = loadJSON("../static/data/pums_naics_to_iocode.json");

module.exports = function(app) {

  app.get("/api/geo/children/:id/", async(req, res) => {

    const {id} = req.params;
    const {level} = req.query;

    const prefix = id.slice(0, 3);
    let cut, drilldown;

    if (["Nation", "State"].includes(level)) {
      cut = false;
      drilldown = level;
    }
    else if (prefix === "040") { // State
      cut = id;
      drilldown = level || "County";
    }
    else if (prefix === "050") { // County
      cut = id;
      drilldown = level || "Tract";
    }
    else if (prefix === "310") { // MSA
      cut = await axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=state&overlapSize=true`)
        .then(resp => resp.data)
        .then(arr => arr.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid);
      drilldown = level || "County";
    }
    else if (prefix === "160") { // Place
      cut = `040${id.slice(3, 9)}`;
      drilldown = level || "Place";
    }
    else if (prefix === "795") { // Puma
      cut = `040${id.slice(3, 9)}`;
      drilldown = level || "PUMA";
    }
    else {
      cut = "01000US";
      drilldown = level || "State";
    }

    res.json({cut, drilldown});

  });

  app.get("/api/geo/childrenCounty/:id/", async(req, res) => {

    const {id} = req.params;

    const prefix = id.slice(0, 3);
    let level, parent;

    if (prefix === "010") {
      parent = false;
      level = "State";
    }
    else if (prefix === "310") {
      parent = await axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=state&overlapSize=true`)
        .then(resp => resp.data)
        .then(arr => arr.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid);
      level = "County";
    }
    else {
      parent = `040${id.slice(3, 9)}`;
      level = "County";
    }

    res.json({cut: parent, drilldown: level});

  });

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

  app.get("/api/naics/:id/io/:level", (req, res) => {

    const {id, level} = req.params;
    const matches = naics2io[id] || {};
    const available = matches.L1 ? "L1" : "L0";
    res.json({id: matches[available], level: level.replace(/L[0-9]$/g, available)});

  });

};
