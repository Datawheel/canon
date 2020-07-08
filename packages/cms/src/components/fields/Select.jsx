import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./Select.css";

export default class Select extends Component {
  render() {
    const {
      className,
      disabled,
      namespace,   // "cp" (default) or "cms"
      fontSize,
      inline,
      label,       // the label
      labelHidden, // hide the label (label still required)
      options,     // array of options
      children,    // when creating options from an array isn't enough
      value,       // select value
      tabIndex,
      onChange     // callback function; select a new option
    } = this.props;

    // remove stringified nulls
    const filteredOptions = options && options.filter(option => option !== "");

    return options && options.length || children
      ? <label className={`${className ? `${className} ` : ""}${namespace}-select-label u-font-${fontSize}${inline ? " cms-inline-select-label" : ""}`}>
        {label && <span className={`${namespace}-select-text${label && labelHidden ? " u-visually-hidden" : "" }`}>
          {label}
        </span>}

        <Icon className={`${namespace}-select-icon`} icon="caret-down" />

        <select disabled={disabled} className={`${namespace}-select ${disabled ? `${namespace}-select-disabled` : ""}`} onChange={onChange} value={value} tabIndex={tabIndex}>
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
  namespace: "cp"
};
