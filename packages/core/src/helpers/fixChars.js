/**
  @desc encodes plus signs and octothorpes
*/
export function encodeChars(d) {
  return `${d}`
    .replace(/\+/g, "%2B")
    .replace(/\#/g, "%23");
}

/**
  @desc turns plus signs and octothorpes back to human-readable
*/
export function decodeChars(d) {
  return `${d}`
    .replace(/\%2B/g, "+")
    .replace(/\%23/g, "#");
}
