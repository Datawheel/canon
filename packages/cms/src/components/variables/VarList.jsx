import React, {Component} from "react";
import "./VarList.css";

export default class VarList extends Component {
  render() {
    const {vars} = this.props;

    return vars && vars.length
      ? <ul className="cms-var-list">
        {vars.map((item, i) =>
          <li
            className={`cms-var-item${
              !item || typeof item === "object" ? " cms-error-var-item" : ""
            }${
              item && item.toString().indexOf("(default)") >= 0 ? " cms-default-var-item" : ""
            }`}
            key={`var-list-${i}`}
          >
            {item ? item.toString() : "undefined"}
          </li>
        )}
      </ul>
      : null
    ;
  }
}
