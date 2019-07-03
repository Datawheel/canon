import React, {Component} from "react";
import "./SectionGrouping.css";

export default class SectionGrouping extends Component {
  render() {
    const {children, layout} = this.props;

    return (
      <div className={`cp-section-grouping cp-${layout.toLowerCase()}-section-grouping`}>
        <div className="cp-section-grouping-inner">
          {children}
        </div>
      </div>
    );
  }
}
