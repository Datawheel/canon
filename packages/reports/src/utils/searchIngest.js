const axios = require("axios");
const {keyDiver} = require("./js/arrayUtils");
const {strip} = require("d3plus-text");
const stripHTML = require("./formatters/stripHTML");
const slugify = str => strip(stripHTML(str)).replace(/-{2,}/g, "-").toLowerCase();

const searchIngest = async(db, config) => {

  const {path, accessor, idKey, name, namespace, properties} = config;

  const memberFetch = await axios.get(path).catch(e => ({error: e}));
  // if (memberFetch.error) return res.json(memberFetch); //todo1.0 error bubble
  const members = keyDiver(memberFetch.data, accessor);

  const searchMembers = members.map(d => ({
    id: d[idKey],
    slug: slugify(d[name]),
    namespace,
    properties: Object.keys(properties || {}).reduce((acc, p) => ({...acc, [properties[p]]: d[p]}), {})
  }));

  // todo1.0 don't do this remover
  await db.search.destroy({where: {namespace}});
  await db.search.bulkCreate(searchMembers);

  const contentHash = await db.search.findAll().then(arr => arr.reduce((acc, d) => ({...acc, [d.id]: d.contentId}), {}));

  const contentMembers = members.map(d => ({
    id: contentHash[d[idKey]],
    locale: "en",
    name: d[name]
  }));

  await db.search_content.bulkCreate(contentMembers);

};

module.exports = {searchIngest};
