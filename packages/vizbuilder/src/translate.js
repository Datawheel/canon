let translate = function(a, b) {
  return `${a}`;
};

if (typeof window === "object") {
  window["translations"] = {};

  translate = function(label, values) {
    window["translations"][label] = [label, values];
    return `${label}`
  };
}

export default translate;
