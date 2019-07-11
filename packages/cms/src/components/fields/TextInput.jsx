import React, {Component} from "react";
// import {Icon} from "@blueprintjs/core";
import "./TextInput.css";

export default class TextInput extends Component {
  render() {
    const {
      context,     // "cp" (default) or "cms"
      disabled,
      fontSize,
      inline,
      label,       // the label
      labelHidden, // hide the label (label still required)
      onChange,    // callback function
      placeholder, // placeholder text
      value        // input value
    } = this.props;

    return (
      <label className={`${context}-input-label u-font-${fontSize}${inline ? " cms-inline-input-label" : ""}`}>
        <span className={`${context}-input-text${label && labelHidden ? " u-visually-hidden" : "" }`}>
          {label}
        </span>

        <input
          className={`${context}-input u-font-${fontSize}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          tabIndex={disabled ? "-1" : null}
        />
      </label>
    );
  }
}

TextInput.defaultProps = {
  fontSize: "sm",
  context: "cp",
  label: "missing `label` prop in TextInput.jsx"
};
