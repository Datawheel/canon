const axios = require("axios");

const {strip} = require("d3plus-text");
const stripHTML = require("../utils/formatters/stripHTML");
const slugify = str => strip(stripHTML(str)).replace(/-{2,}/g, "-").toLowerCase();

module.exports = function(app) {

  const {db} = app.settings;

  app.post("/api/reports/ingest", async(req, res) => {

    const {path, accessor, label, slug, id, name} = req.body;

    const memberFetch = await axios.get(path).catch(e => ({error: e}));
    if (memberFetch.error) return res.json(memberFetch);
    const members = memberFetch.data[accessor];
    const searchMembers = members.map(d => ({
      id: d[id],
      slug: slugify(d[name]),
      namespace: slug
    }));

    await db.search.destroy({where: {namespace: slug}});

    await db.search.bulkCreate(searchMembers);

    const contentHash = await db.search.findAll().then(arr => arr.reduce((acc, d) => ({...acc, [d.id]: d.contentId}), {}));

    const contentMembers = members.map(d => ({
      id: contentHash[d[id]],
      locale: "en",
      name: d[name]
    }));

    await db.search_content.bulkCreate(contentMembers);

    return res.json("OK");

  });

};
