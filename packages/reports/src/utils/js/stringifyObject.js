const newLine = d => "\n".padEnd(d * 2 + 1, " ");

/**
 * Custom stringify function that takes care of converting functions from strings
 * @param {*} obj
 * @param {*} depth
 * @returns
 */
export const stringifyObject = (obj, depth = 0) => {

  // Arrays are Objects. Needed to determine if the wrapper
  // charactares should be square brackets or curly braces.
  const isArray = obj instanceof Array;

  return `${isArray ? "[" : "{"}${newLine(depth + 1)}${Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .map(key => {
      let str = isArray ? "" : `${key}: `;
      const val = obj[key];

      // recursive check for objects/arrays
      if (typeof val === "object") str += `${stringifyObject(val, depth + 1)}`;
      // detect fat arrow functions and don't wrap with quotation marks
      else if (typeof val === "string" && (val.includes("=>") || val.startsWith("variables["))) str += `${val}`;
      // set all empty strings to a false Boolean
      else if (typeof val === "string" && !val.length) str += "false";
      // skip undefined variables
      else if (val === undefined) str = null;
      // coerce leftover values into strings
      else str += `"${val}"`;

      return str;
    })
    .filter(Boolean)
    .join(`,${newLine(depth + 1)}`)}${newLine(depth)}${isArray ? "]" : "}"}`;
};
