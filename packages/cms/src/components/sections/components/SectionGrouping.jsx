import React, {Component} from "react";
import toKebabCase from "../../../utils/formatters/toKebabCase";
import "./SectionGrouping.css";

export default class SectionGrouping extends Component {
  render() {
    const {children} = this.props;

    const {layout} = this.props;
    const layoutClass = `cp-${toKebabCase(layout)}-section-grouping`;


    return (
      <div className={`cp-section-grouping ${layoutClass}`}>
        <div className={`cp-section-grouping-inner ${layoutClass}-inner`}>
          {children}
        </div>
      </div>
    );
  }
}
