import { Client } from "mondrian-rest-client";
import { queryBuilder } from "./query";

/** @type {Client} */
var client;

export function initClient(src) {
  client = new Client(src);
}

export function cubes() {
  return client.cubes();
}

export function members(level) {
  return client.members(level);
}

export function query(params) {
  if (!params.cube)
    throw new Error("Invalid query: No 'cube' property defined.");

  params = {
    measures: [],
    drillDowns: [],
    cuts: [],
    options: {},
    locale: "en",
    limit: undefined,
    offset: undefined,
    order: undefined,
    orderDesc: undefined,
    ...params
  };

  return client.cube(params.cube).then(cube => {
    const query = queryBuilder(cube.query, params);
    return client.query(query, params.format || "jsonrecords");
  });
}
