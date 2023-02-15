// Scaffold user-defined selector array into full-fledged Selector
export default optionsArray =>
  optionsArray.map(d => {
    if (typeof d === "string") {
      return {option: d, allowed: "always", label: d};
    }
    else {
      return {allowed: "always", label: d.option, ...d};
    }
  })
;
