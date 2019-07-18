import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./Select.css";

export default class Select extends Component {
  render() {
    const {
      context,     // "cp" (default) or "cms"
      fontSize,
      inline,
      label,       // the label
      labelHidden, // hide the label (label still required)
      options,     // array of options
      children,    // when creating options from an array isn't enough
      value,       // select value
      onChange     // callback function; select a new option
    } = this.props;

    // remove stringified nulls
    const filteredOptions = options && options.filter(option => option !== "");

    return (options && options.length) || children
      ? <label className={`${context}-select-label u-font-${fontSize}${inline ? " cms-inline-select-label" : ""}`}>
        <span className={`${context}-select-text${label && labelHidden ? " u-visually-hidden" : "" }`}>
          {label || "missing `label` prop in Select.jsx"}
        </span>

        <Icon className={`${context}-select-icon`} icon="caret-down" />

        <select className={`${context}-select`} onChange={onChange} value={value}>
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
  fontSize: "sm",
  context: "cp"
};
