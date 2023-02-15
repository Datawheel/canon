/**
  @name FUNC
  @desc Similar to the JSON.parse and JSON.stringify methods, these functions
  convert functions to and from object representations of themselves:
  @example object representation: {vars: ["d", "i"], logic: "return d.x * i;"}
*/

import libs from "./libs";
import { isObject } from "d3plus-common";
import { trim } from "d3plus-text";
const buble = require("buble");

export function objectify(obj) {
  if (obj.vars && obj.logic) return obj;
  for (const key in obj) {
    if (typeof obj[key] === "function") {
      obj[key] = func2obj(obj[key]);
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((d) => {
        if (typeof d === "function") return func2obj(d);
        if (isObject(d) && !obj.vars && !obj.logic) return objectify(d);
        return d;
      });
    } else if (isObject(obj[key])) objectify(obj[key]);
  }
  return obj;
}

function func2obj(func) {
  let s = buble.transform(`${func}`).code;
  console.log(func);
  console.log(s);
  console.log("\n");
  if (s.startsWith("!")) s = s.slice(1);

  const vars = s
    .replace(/function[\sA-z]*\(([A-z0-9\s\,]*)\)[\s\S]*/g, "$1")
    .split(",")
    .map(trim);
  const logic = s
    .replace(/function[\sA-z]*\([A-z0-9\s\,]*\)[\s]*\{([\s\S]*)\}$/g, "$1");

  return {vars, logic};
}

export function parse(config, formatters = {}, locale = "en", actions = {}) {
  const globals = {
    setVariables: actions.onSetVariables ? actions.onSetVariables : (d) => d,
    openModal: actions.onOpenModal ? actions.onOpenModal : (d) => d,
    formatters,
    libs,
    locale,
  };

  function parseFunction(obj) {
    return Function("globals", ...obj.vars, `with (globals) { ${obj.logic} }`)
      .bind(globals, globals);
  }

  function makeFunctions(obj) {
    if (obj.vars && obj.logic) {
      return parseFunction(obj);
    }

    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map((d) => {
          if (isObject(d)) return makeFunctions(d);
          return d;
        });
      } else if (isObject(obj[key])) obj[key] = makeFunctions(obj[key]);
    }
    return obj;
  }

  return makeFunctions(config);
}