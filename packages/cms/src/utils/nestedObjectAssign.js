const isObject = item => item && typeof item === "object" && !Array.isArray(item);
const isArray = item => item && Array.isArray(item);

/**
 *
 */
export default function nestedObjectAssign(target, ...sources) {

  if (!sources.length) return target;

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key]))  {
        if (!target[key]) {
          Object.assign(target, {[key]: {}});
        } 
        nestedObjectAssign(target[key], source[key]);
      } 
      else if (isArray(source[key])) {
        if (!target[key]) {
          Object.assign(target, {[key]: []});
        }
        target[key] = target[key].concat(source[key]);
      } 
      else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  }
  return nestedObjectAssign(target, ...sources);
}
