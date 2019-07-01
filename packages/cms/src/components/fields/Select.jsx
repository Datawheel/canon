import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./Select.css";

export default class Select extends Component {
  render() {
    const {
      fontSize,
      inline,
      label,       // the label
      labelHidden, // hide the label (label still required)
      options,     // array of options
      children,    // when creating options from an array isn't enough
      value,
      onChange
    } = this.props;

    // remove stringified nulls
    const filteredOptions = options && options.filter(option => option !== "");

    return (options && options.length) || children
      ? <label
        className={`cms-select-label font-${fontSize}${inline ? " cms-inline-select-label" : ""}`}
        value={value}
      >
        <span className={`cms-select-text${label && labelHidden ? " u-visually-hidden" : "" }`}>
          {label || "missing `label` prop in Select.jsx"}
        </span>

        <Icon className="cms-select-icon" icon="caret-down" />

        <select className="cms-select" onChange={onChange} value={value}>
          {options && filteredOptions.map(option =>
            <option value={option} key={`select-option-${option}`}>
              {option}
            </option>
          )}
          {children}
        </select>
      </label>
      : "missing or malformed `options` or `children` prop in Select.jsx";
  }
}

Select.defaultProps = {
  fontSize: "sm"
};
