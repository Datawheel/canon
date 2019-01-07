import {MultiClient} from "mondrian-rest-client";

/** @type {MultiClient} */
let client;

/**
 * Resets the client object used site-wide with a new URL.
 * @param {string} src The URL for the mondrian server.
 * @returns {void}
 */
export function resetClient(src) {
  client = new MultiClient(src);
}

/**
 * Returns a Promise that resolves to an array with all the
 * cubes available in the current mondrian server.
 */
export function cubes() {
  return client.cubes();
}

/**
 * Returns a Promise that resolves to an array with all the
 * members available for a certain level element.
 * Each member has all their internal properties.
 * @param {Level} level A mondrian-rest-client Level element
 */
export function members(level) {
  return client.members(level);
}

/**
 * Returns a Promise that resolves to the results of the current query
 * for the mondrian server.
 * @param {object} params The `query` element from the Vizbuilder's state.
 */
export function query(query, format = "jsonrecords") {
  return client.query(query, format);
}
