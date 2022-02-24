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

const fetchReportFromDimensionSlug = async(db, slug, withContent = false) => {
  const meta = await db.report_meta.findOne({where: {slug}}).catch(catcher); 
  const report = await db.report
    .findOne({where: {id: meta.report_id}, ...withContent ? reportReqFull : {include: [{association: "meta"}]}})
    .then(d => d.toJSON())
    .catch(catcher); 
  return report;
};

const fetchMemberFromMemberIdOrSlug = async(db, member, dimension, withContent = false) => {
  const reqObj = {where: {[sequelize.Op.or]: [{id: member}, {slug: member}]}};
  if (dimension) {
    const meta = await db.report_meta.findOne({where: {[sequelize.Op.or]: [{id: dimension}, {slug: dimension}]}}).catch(catcher);
    if (meta) {
      reqObj.where.namespace = meta.namespace;
      reqObj.where.properties = meta.properties;
    }
  }
  if (withContent) reqObj.include = [{association: "image", include: [{association: "contentByLocale"}]}, {association: "contentByLocale"}];
  const result = await db.search.findOne(reqObj).catch(catcher);
  return result;
};

/**
 * Given report/member pairs, where members can have non-unique ids, look up the report and use it
 * to select the correct search member.
 * @param {Object} db Reference to the sequelize instance
 * @param {Array} dims Ordered list of {report/member} pairs
 * @param {String} locale Two character language code
 */
const fetchReportAndAttributesFromIdsOrSlugs = async(db, dims, locale) => {
  
  const slug = dims[0] && dims[0].dimension;
  if (!slug) return {error: "searchHelpers - Report not found"};
  const report = await fetchReportFromDimensionSlug(db, slug, true).catch(catcher);
  
  let foundAll = true;
  for (const dim of dims) {
    const member = await fetchMemberFromMemberIdOrSlug(db, dim.member, dim.dimension).catch(catcher);
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
    attributes: await fetchAttributesFromMemberSlugs(db, dims.map(d => d.member), locale)
  };
};

const fetchAttributesFromMemberSlugs = async(db, slugs, locale) => {
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

module.exports = {fetchReportAndAttributesFromIdsOrSlugs, fetchAttributesFromMemberSlugs, fetchMemberFromMemberIdOrSlug};
