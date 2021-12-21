/**
 * Given an object, crawls down keys recursively looking for arrays. Returns a list of
 * string accessors, separated by dots if nested, e.g., "data.payload.results"
 */
const arrayFinder = obj => {
  const keys = [];
  if (Array.isArray(obj)) return [];
  const parse = (obj, prefix = "") => {
    if (typeof obj !== "object") return;
    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key])) {
        keys.push(`${prefix ? `${prefix}.` : ""}${key}`);
      }
      else if (typeof obj[key] === "object") {
        parse(obj[key], `${prefix ? `${prefix}.` : ""}${key}`);
      }
      else return;
    });
  };
  parse(obj);
  return keys;
};

/**
 * Given an object and a dot-separated string accessor like "prop1.prop2.prop3", drill down to find the nested value
 */
const keyDiver = (obj, str) => !str ? obj : typeof str === "string" ? str.split(".").reduce((o, i) => o[i], obj) : obj;

/**
 *
 */
const insertAtOrdering = (array, id, ordering) => {
  // remove the item from the array by id
  let items = array.filter(d => d !== id);
  // insert it at the ordering spot
  items.splice(ordering, 0, id);
  // set orderings based on array location
  items = items.map((d, i) => ({id: d, ordering: i}));
  // create an ordering lookup hash
  const itemOrderings = items.reduce((acc, d) => ({...acc, [d.id]: d.ordering}), {});
  return items.map(d => ({...d, ordering: itemOrderings[d.id]})).sort((a, b) => a.ordering - b.ordering).map(d => d.id);
};

module.exports = {arrayFinder, keyDiver, insertAtOrdering};
