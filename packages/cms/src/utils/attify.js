// Given a list of search rows, "attribute-ify" them into a single numerically-keyed object
module.exports = (searchRows, locale) => 
  searchRows.reduce((acc, d, i) => (
    {
      ...acc,
      [`id${i + 1}`]: d.id,
      [`slug${i + 1}`]: d.slug,
      [`name${i + 1}`]: d.name,
      [`dimension${i + 1}`]: d.dimension,
      [`hierarchy${i + 1}`]: d.hierarchy,
      [`parents${i + 1}`]: d.parents
    }
  ), {
    id: searchRows[0].id,
    slug: searchRows[0].slug,
    name: searchRows[0].name,
    dimension: searchRows[0].dimension,
    hierarchy: searchRows[0].hierarchy,
    parents: searchRows[0].parents
  });
