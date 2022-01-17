import React, {Component} from "react";
// import {Icon} from "@blueprintjs/core";
import "./Textarea.css";

export default class Textarea extends Component {
  render() {
    const {
      className,
      namespace,     // "cp" (default) or "cms"
      autoFocus,
      disabled,
      fontSize,
      labelFontSize,
      inline,
      label,         // the label
      labelHidden,   // hide the label (label still required)
      name,
      onChange,      // callback function
      placeholder,   // placeholder text
      value          // input value
    } = this.props;

    return (
      <label className={`${namespace}-input-label ${namespace}-textarea-label u-font-${fontSize}${inline ? " cms-inline-input-label" : ""}${className ? ` ${className}` : ""}`}>
        <span className={`${namespace}-input-text ${namespace}-textarea-text u-font-${labelFontSize || fontSize}${label && labelHidden ? " u-visually-hidden" : "" }`}>
          {label}
        </span>

        <textarea
          className={`${namespace}-input ${namespace}-textarea u-font-${fontSize}`}
          value={value}
          onChange={onChange}
          name={name}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          tabIndex={disabled ? "-1" : null}
        />
      </label>
    );
  }
}

Textarea.defaultProps = {
  fontSize: "sm",
  namespace: "cp",
  label: "missing `label` prop in Textarea.jsx"
};
