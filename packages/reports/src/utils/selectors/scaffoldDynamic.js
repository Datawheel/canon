// Scaffold user-defined selector array into full-fledged Selector
module.exports = optionsArray => {
  if (!Array.isArray(optionsArray)) return [];
  return optionsArray.map(d => {
    if (typeof d === "string") {
      return {id: d, allowed: "always", label: d};
    }
    else {
      return {allowed: "always", label: d.id, ...d};
    }
  });
};