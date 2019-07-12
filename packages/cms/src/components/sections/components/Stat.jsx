import React, {Component} from "react";
import Parse from "./Parse";
import "./Stat.css";

export default class Stat extends Component {
  render() {
    const {className, label, value, subtitle} = this.props;

    return (
      <dl className={`cp-stat${className ? ` ${className}` : ""}`}>
        <dt className="cp-stat-label">
          <Parse El="span" className="cp-stat-label-text label">
            {label}
          </Parse>
        </dt>

        <dd className="cp-stat-value">
          <Parse El="span" className="cp-stat-value-text heading">
            {value}
          </Parse>

          {subtitle &&
            <React.Fragment>
              <span className="u-visually-hidden">:</span>
              <Parse El="span" className="cp-stat-subtitle">
                {subtitle}
              </Parse>
            </React.Fragment>
          }
        </dd>
      </dl>
    );
  }
}
