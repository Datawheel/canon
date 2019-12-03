import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

import stripHTML from "../../../utils/formatters/stripHTML";
import Parse from "./Parse";
import "./Stat.css";

class Stat extends Component {

  /** assigns a class based on the length of the string */
  generateLengthClass(str) {
    const length = stripHTML(str).length;

    let className = "length-sm";

    if      (length > 40) className = "length-xxl";
    else if (length > 30) className = "length-xl";
    else if (length > 20) className = "length-lg";
    else if (length > 10) className = "length-md";

    return className;
  }

  render() {
    const {className, El, label, value, subtitle} = this.props;

    return (
      <El className={`cp-stat${className ? ` ${className}` : ""}`}>
        {label && <Fragment>
          <span className="cp-stat-label">
            <Parse El="span" className={`cp-stat-label-text label ${this.generateLengthClass(label)}`}>
              {label}
            </Parse>
          </span>
          <span className="u-visually-hidden">: </span>
        </Fragment>}

        <span className="cp-stat-value">
          <Parse El="span" className={`cp-stat-value-text heading ${this.generateLengthClass(value)}`}>
            {value}
          </Parse>

          {subtitle && subtitle !== "<p>New Subtitle</p>" &&
            <Fragment>
              <span className="u-visually-hidden">, </span>
              <Parse El="span" className={`cp-stat-subtitle heading ${this.generateLengthClass(subtitle)}`}>
                {subtitle}
              </Parse>
            </Fragment>
          }
        </span>
      </El>
    );
  }
}

Stat.defaultProps = {
  El: "li"
};

export default hot(Stat);
