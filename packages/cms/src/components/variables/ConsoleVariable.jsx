import React, {Component} from "react";
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

export default class ConsoleVariable extends Component {

  render() {
    const {value} = this.props;
    const JSON_CUTOFF = 1000;
    const ARRAY_CUTOFF = 5;

    const t = evalType(value);
    let v = value;
    if (t === "string") v = `"${v}"`;
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

    return <span className={`cms-variable ${t}`}>{v}</span>;

  }

}
