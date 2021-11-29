// Profiles receive arbitrary query params of type ?slug1=geo&id1=mass&slug2=geo&id2=nyc
// Extract and collate these into an object.
module.exports = obj => {
  let dims = [];
  Object.keys(obj).forEach(key => {
    ["slug", "id"].forEach(param => {
      if (key.startsWith(param)) {
        // get the trailing number identifier, or make it first if not provided (slug = slug1)
        let num = key.replace(/^\D+/g, "");
        num === "" ? num = 0 : num = Number(num) - 1;
        dims[num] ? dims[num][param] = obj[key] : dims[num] = {[param]: obj[key]};
      }
    });
  });
  // If any values look like <this> then they haven't been swapped in the canon need.
  // Remember the Profile need takes three slug/id pairs, but single or double profiles
  // will NOT have anything to swap for the later slugs, so they stay as <slug3> etc.
  // Remove those from the list.
  const isValid = d => !d.includes("<") && !d.includes(">");
  dims = dims.filter(d => isValid(d.slug) && isValid(d.id));
  return dims;
};
