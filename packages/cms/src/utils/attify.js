// Given a list of search rows, "attribute-ify" them into a single numerically-keyed object
module.exports = (searchRows, locale) => 
  searchRows.reduce((acc, d, i) => (
    {
      ...acc,
      [`id${i + 1}`]: d.id,
      [`slug${i + 1}`]: d.slug,
      [`name${i + 1}`]: d.content.find(o => o.locale === locale) ? d.content.find(o => o.locale === locale).name : "",
      [`dimension${i + 1}`]: d.dimension,
      [`hierarchy${i + 1}`]: d.hierarchy,
      [`cubeName${i + 1}`]: d.cubeName,
      [`parents${i + 1}`]: d.parents
    }
  ), searchRows.length > 0 ? {
    id: searchRows[0].id,
    slug: searchRows[0].slug,
    name: searchRows[0].content.find(o => o.locale === locale) ? searchRows[0].content.find(o => o.locale === locale).name : "",
    dimension: searchRows[0].dimension,
    hierarchy: searchRows[0].hierarchy,
    cubeName: searchRows[0].cubeName,
    parents: searchRows[0].parents
  } : {});
