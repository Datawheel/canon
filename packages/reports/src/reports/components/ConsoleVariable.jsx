import React from "react";
import {Text} from "@mantine/core";
import "./ConsoleVariable.css";

const evalType = value => {
  let t = typeof value;
  if (t === "object") {
    if (value === null) return "undefined";
    else if (["Array"].includes(value.constructor.name)) t = "array";
    else if (["Error", "EvalError", "ReferenceError", "SyntaxError"].includes(value.constructor.name)) t = "error";
  }
  return t;
};

/**
 * Displays a variable output by a block.
 * @param {*} value
 */
function ConsoleVariable({value}) {

  const JSON_CUTOFF = 1000;
  const ARRAY_CUTOFF = 5;
  const STRING_CUTOFF = 12; // todo1.0 this is temporary due to dave's inputmenu width

  const t = evalType(value);
  let v = value;
  if (t === "string") v = `"${v.substring(0, STRING_CUTOFF)}${v.length > STRING_CUTOFF ? "..." : ""}"`;
  else if (t === "object") {
    const str = JSON.stringify(v, null, 2);
    v = str.length > JSON_CUTOFF ? <pre>JSON object too large to display.</pre> : <pre>{ str }</pre>;
  }
  else if (t === "error") v = `Error: ${v.message}`;
  else if (t === "undefined") v = t;
  else if (t === "array") {
    v = <span>{v.slice(0, ARRAY_CUTOFF).map((l, i) => <span key={i}><ConsoleVariable value={l} /></span>)}</span>;
  }
  else if (v.toString) v = v.toString();

  return <Text size="xs" lineClamp={1} className={`cr-variable ${t}`}>{v}</Text>;

}

export default ConsoleVariable;
