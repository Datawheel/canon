import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

import Parse from "./Parse";
import "./Stat.css";

class Stat extends Component {
  render() {
    const {className, label, value, subtitle} = this.props;

    return (
      <li className={`cp-stat${className ? ` ${className}` : ""}`}>
        <span className="cp-stat-label">
          {label &&
            <Parse El="span" className="cp-stat-label-text label">
              {label}
            </Parse>
          }
        </span>

        <span className="cp-stat-value">
          <Parse El="span" className="cp-stat-value-text heading">
            {value}
          </Parse>

          {subtitle && subtitle !== "<p>New Subtitle</p>" &&
            <Fragment>
              <span className="u-visually-hidden">:</span>
              <Parse El="span" className="cp-stat-subtitle">
                {subtitle}
              </Parse>
            </Fragment>
          }
        </span>
      </li>
    );
  }
}

export default hot(Stat);
