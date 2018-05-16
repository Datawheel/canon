import { Client as MondrianClient } from "mondrian-rest-client";
import { queryBuilder } from "./query";

var client;
var state;

export function init(src) {
  client = new MondrianClient(src);
}

export function cubes() {
  return client.cubes().then(cubes => ({ cubes }));
}

export function query(query) {
  return queryBuilder(query);
}
