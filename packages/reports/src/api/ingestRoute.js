const axios = require("axios");
const yn = require("yn");
const {strip} = require("d3plus-text");
const stripHTML = require("../utils/formatters/stripHTML");
const slugify = str => strip(stripHTML(str)).replace(/-{2,}/g, "-").toLowerCase();
const {keyDiver} = require("../utils/arrayFinder");

const verbose = yn(process.env.CANON_CMS_LOGGING);

const catcher = e => {
  if (verbose) console.error(`error in ingestRoute: ${e.message}`);
  return [];
};

module.exports = function(app) {

  const {db} = app.settings;

  const ingest = async config => {

    const {id, path, accessor, idKey, name, namespace} = config;

    const memberFetch = await axios.get(path).catch(e => ({error: e}));
    // if (memberFetch.error) return res.json(memberFetch); //todo1.0 error bubble
    const members = keyDiver(memberFetch.data, accessor);

    const searchMembers = members.map(d => ({
      id: d[idKey],
      slug: slugify(d[name]),
      namespace
    }));

    await db.search.destroy({where: {namespace}});
    await db.search.bulkCreate(searchMembers);

    const contentHash = await db.search.findAll().then(arr => arr.reduce((acc, d) => ({...acc, [d.id]: d.contentId}), {}));

    const contentMembers = members.map(d => ({
      id: contentHash[d[id]],
      locale: "en",
      name: d[name]
    }));

    await db.search_content.bulkCreate(contentMembers);

  };

  app.post("/api/reports/dimension/upsert", async(req, res) => {

    const {config} = req.body;

    await db.report_meta.upsert(config);
    await ingest(config);



    return res.json("OK");

  });

};
