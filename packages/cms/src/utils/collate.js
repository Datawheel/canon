// Profiles receive arbitrary query params of type ?slug1=geo&id1=mass&slug2=geo&id2=nyc
// Extract and collate these into an object.
module.exports = obj => {
  const dims = [];
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
  return dims;
};
