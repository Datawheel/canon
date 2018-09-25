/** */
function findName(d) {
  return d.name || d.dimension;
}

module.exports = function(dimensions) {
  const dims = dimensions.filter(d => findName(d).includes("Year"));
  let dim;
  if (dims.length === 1) dim = dims[0];
  else if (dims.find(d => findName(d).includes("End"))) dim = dims.find(d => findName(d).includes("End"));
  else dim = dims[0];
  return {
    dimensions: dims,
    preferred: dim
  };
};
