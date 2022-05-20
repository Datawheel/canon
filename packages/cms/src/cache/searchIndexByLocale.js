const lunr = require("lunr");
require("lunr-languages/lunr.stemmer.support")(lunr);
const yn = require("yn");

const whitelist = ["ar", "da", "de", "du", "en", "es", "fi", "hi", "hu", "it", "ja", "jp", "nl", "no", "pt", "ro", "ru", "sv", "ta", "th", "tr", "vi", "zh"];

const {CANON_LANGUAGES, CANON_CMS_LUNR} = process.env;

const locales = CANON_LANGUAGES ? CANON_LANGUAGES.split(",").filter(d => whitelist.includes(d)) : [];

const nonEnLocales = locales.filter(d => d !== "en");

for (const locale of nonEnLocales) {
  require(`lunr-languages/lunr.${locale}`)(lunr);
}

module.exports = async function(app) {

  if (!yn(CANON_CMS_LUNR)) return {};

  const {db} = app;

  const results = await db.search
    .findAll({include: [{association: "content"}]})
    .then(arr => arr.map(d => d.toJSON()))
    .catch(() => []);

  const searchIndexByLocale = {};

  for (const locale of locales) {
    searchIndexByLocale[locale] = lunr(function() {

      if (locale && locale !== "en") this.use(lunr[locale]);

      this.ref("id");

      this.field("name");
      this.field("keywords");
      this.field("attr");

      this.pipeline.reset();
      this.searchPipeline.reset();

      results.forEach(result => {
        const content = result.content.find(d => d.locale === locale);
        if (content) {
          const payload = {
            id: content.id,
            name: content.name,
            keywords: content.keywords,
            attr: content.attr
          };
          this.add(payload, {boost: result.zvalue});
        }
      }, this);
    });
  }

  return searchIndexByLocale;

};
