import {Client} from "mondrian-rest-client";
import {queryBuilder, queryConverter} from "./query";
import {getIncludedMembers} from "./sorting";

/** @type {Client} */
let client;
let lastPath, lastQuery;

export function resetClient(src) {
  client = new Client(src);
}

export function cubes() {
  return client.cubes();
}

export function members(level) {
  return client.members(level);
}

export function query(params) {
  if (!params.cube) {
    throw new Error("Invalid query: No 'cube' property defined.");
  }

  const query = queryBuilder(params.cube.query, queryConverter(params));

  const newPath = query.path();
  if (newPath !== lastPath) {
    lastPath = newPath;
    lastQuery = client
      .query(query, params.format || "jsonrecords")
      .then(result => {
        const dataset = (result.data || {}).data || [];
        const members = getIncludedMembers(query, dataset);
        return {dataset, members};
      });
  }

  return Promise.resolve(lastQuery);
}
