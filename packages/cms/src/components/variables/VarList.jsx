import React, {Component} from "react";
import "./VarList.css";

export default class VarTable extends Component {
  render() {
    const {vars} = this.props;

    return vars && vars.length
      ? <ul className="cms-var-list">
        {vars.map(item =>
          <li
            className={`cms-var-item${
              !item || typeof item === "object" ? " cms-error-var-item" : ""
            }${
              item && item.toString().indexOf("(default)") >= 0 ? " cms-default-var-item" : ""
            }`}
            key={`var-list-${item}-${Math.random()}`}
          >
            {item ? item.toString() : "undefined"}
          </li>
        )}
      </ul>
      : null
    ;
  }
}
