const contentReducer = require("../blocks/contentReducer");
const verbose = require("../canon/getLogging")();
const sequelize = require("sequelize");
const {reportReqFull} = require("../sequelize/ormHelpers");

const catcher = e => {
  if (verbose) console.log("Error in searchHelpers", e);
  return false;
};

const fallback = e => {
  if (verbose) console.log("Lookup error in searchHelpers", e);
  return {};
};

const fetchReportFromDims = async(db, dims) => {
  const slug = dims[0].dimension ? dims[0].dimension : false;
  const meta = await db.report_meta.findOne({where: {slug}}).catch(catcher); 
  const report = await db.report.findOne({where: {id: meta.report_id}, ...reportReqFull}).then(d => d.toJSON()).catch(catcher); 
  return report;
};

/**
 * Given report/member pairs, where members can have non-unique ids, look up the report and use it
 * to select the correct search member.
 * @param {Object} db Reference to the sequelize instance
 * @param {Array} dims Ordered list of {report/member} pairs
 * @param {String} locale Two character language code
 */
const fetchReportAndAttributesFromIdsOrSlugs = async(db, dims, locale) => {
  
  const report = await fetchReportFromDims(db, dims).catch(catcher);
  
  let foundAll = true;
  for (const dim of dims) {
    const thisMeta = report.meta.find(d => d.slug === dim.dimension);
    const member = await db.search.findOne({where: {
      [sequelize.Op.or]: [{id: dim.member}, {slug: dim.member}],
      properties: thisMeta.properties
    }}).catch(catcher);
    if (member) {
      dim.member = member.slug;
    }
    else {
      foundAll = false;
    }
  }
  if (!foundAll) return fallback("id not found");
  return {
    report,
    attributes: await fetchAttributesFromSlugs(db, dims.map(d => d.member), locale)
  };
};

const fetchAttributesFromSlugs = async(db, slugs, locale) => {
  if (!slugs) return {};

  const attributes = await db.search
    .findAll({where: {slug: slugs}, include: {association: "contentByLocale"}})
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
      .sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug))
      .reduce((acc, d) => ({...acc, ...d}), {}))
    .catch(() => {}); // todo1.0 errors man

  return attributes;
};

module.exports = {fetchReportAndAttributesFromIdsOrSlugs, fetchAttributesFromSlugs};
