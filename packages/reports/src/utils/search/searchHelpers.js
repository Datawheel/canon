const contentReducer = require("../blocks/contentReducer");

const generateAttributesFromSlugs = async(db, pid, slugs, locale) => {
  if (!slugs) return {};

  // ids are not necessarily deduplicated across namespaces. Therefore, we must fetch the
  // profile and its metadata, in order to have the specificity required for a unique id lookup.

  // todo1.0: Port content of `fetchAttr` in reportRoute.js to this function.

  const orderedSlugs = slugs.split(",");
  return await db.search
    .findAll({where: {slug: orderedSlugs}, include: {association: "contentByLocale"}})
    .then(arr => arr
      .map(d => ({
        ...d.toJSON(),
        contentByLocale: d.contentByLocale.reduce(contentReducer, {})
      }))
      .map((d, i) => ({
        [`id${i + 1}`]: d.id,
        [`slug${i + 1}`]: d.slug,
        [`namespace${i + 1}`]: d.namespace,
        [`name${i + 1}`]: d.contentByLocale[locale].name,
        ...Object.keys(d.properties).reduce((acc, k) => ({...acc, [`${k}${i + 1}`]: d.properties[k]}), {})
      }))
      .sort((a, b) => orderedSlugs.indexOf(a.slug) - orderedSlugs.indexOf(b.slug))
      .reduce((acc, d) => ({...acc, ...d}), {}))
    .catch(() => {}); // todo1.0 errors man
};

module.exports = {generateAttributesFromSlugs};
