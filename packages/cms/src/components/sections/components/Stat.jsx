import React, {Component} from "react";
import Parse from "./Parse";
import "./Stat.css";

export default class Stat extends Component {
  render() {
    const {label, value, qualifier} = this.props;

    return (
      <dl className="cp-stat">
        <dt className="cp-stat-label">
          <Parse El="span" className="cp-stat-label-text label">
            {label}
          </Parse>
        </dt>

        <dd className="cp-stat-value">
          <Parse El="span" className="cp-stat-value-text heading">
            {value}
          </Parse>

          {qualifier &&
            <React.Fragment>
              <span className="u-visually-hidden">:</span>
              <Parse El="span" className="cp-stat-qualifier">
                {qualifier}
              </Parse>
            </React.Fragment>
          }
        </dd>
      </dl>
    );
  }
}
