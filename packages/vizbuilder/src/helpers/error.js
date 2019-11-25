/**
 * @param {string} name
 * @param {string} [message]
 */
export function errorBuilder(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}
