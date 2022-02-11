// Profiles receive arbitrary query params of type ?dimension1=geo&member1=mass&dimension2=geo&member2=nyc
// Extract and collate these into an object.
module.exports = query => {
  let dims = [];
  Object.keys(query).forEach(key => {
    ["dimension", "member"].forEach(param => {
      if (key.startsWith(param)) {
        // get the trailing number identifier, or make it first if not provided (dimension = dimension1)
        let num = key.replace(/^\D+/g, "");
        num === "" ? num = 0 : num = Number(num) - 1;
        dims[num] ? dims[num][param] = query[key] : dims[num] = {[param]: query[key]};
      }
    });
  });
  // If any values look like <this> then they haven't been swapped in the canon need.
  // Remember the Profile need takes three dimension/id pairs, but single or double profiles
  // will NOT have anything to swap for the later dimensions, so they stay as <dimension3> etc.
  // Remove those from the list.
  const isValid = d => !d.includes("<") && !d.includes(">");
  dims = dims.filter(d => isValid(d.dimension) && isValid(d.member));
  return dims;
};
