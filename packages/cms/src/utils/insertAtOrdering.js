const sorter = (a, b) => a.ordering - b.ordering;

module.exports = (array, id, ordering) => {
  // remove the item from the array by id
  let items = array.sort(sorter).map(d => d.id).filter(d => d !== id);
  // insert it at the ordering spot
  items.splice(ordering, 0, id);
  // set orderings based on array location
  items = items.map((d, i) => ({id: d, ordering: i}));
  // create an ordering lookup hash
  const itemOrderings = items.reduce((acc, d) => ({...acc, [d.id]: d.ordering}), {});
  return array.map(d => ({...d, ordering: itemOrderings[d.id]})).sort((a, b) => a.ordering - b.ordering);
};
