const lunr = require("lunr");
require("lunr-languages/lunr.stemmer.support")(lunr);
require("lunr-languages/lunr.pt")(lunr);

module.exports = async function(app) {

  const {db} = app;

  const results = await db.search_content
    .findAll()
    .then(arr => arr.map(d => ({id: d.id, name: d.name})))
    .catch(() => []);

  const searchIndex = lunr(function() {
    this.use(lunr.pt);
    this.ref("id");
    this.field("name");
    this.pipeline.reset();
    this.searchPipeline.reset();

    results.forEach(result => this.add(result), this);

  });

  return searchIndex;

};
