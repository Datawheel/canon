import { Client as MondrianClient } from "mondrian-rest-client";

var client;

export function init(src) {
  client = new MondrianClient(src);
}

export function cubes() {
  return client.cubes();
}

export function measures() {
  return;
}
