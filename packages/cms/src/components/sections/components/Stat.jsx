import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

import Parse from "./Parse";
import "./Stat.css";

class Stat extends Component {
  render() {
    const {className, El, label, value, subtitle} = this.props;

    return (
      <El className={`cp-stat${className ? ` ${className}` : ""}`}>
        {label && <Fragment>
          <span className="cp-stat-label">
            <Parse El="span" className="cp-stat-label-text label">
              {label}
            </Parse>
          </span>
          <span className="u-visually-hidden">: </span>
        </Fragment>}

        <span className="cp-stat-value">
          <Parse El="span" className="cp-stat-value-text heading">
            {value}
          </Parse>

          {subtitle && subtitle !== "<p>New Subtitle</p>" &&
            <Fragment>
              <span className="u-visually-hidden">, </span>
              <Parse El="span" className="cp-stat-subtitle">
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
