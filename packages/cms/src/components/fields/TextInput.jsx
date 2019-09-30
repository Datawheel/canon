import React, {Component} from "react";
// import {Icon} from "@blueprintjs/core";
import Button from "./Button";
import "./TextInput.css";

export default class TextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false
    };
  }

  render() {
    const {
      context,      // "cp" (default) or "cms"
      autoFocus,
      disabled,
      fontSize,
      labelFontSize,
      inline,
      label,        // the label
      labelHidden,  // hide the label (label still required)
      name,
      type,         // number, password, etc
      onChange,     // callback function
      placeholder,  // placeholder text
      value         // input value
    } = this.props;

    const {showPassword} = this.state;

    return (
      <label className={`${context}-input-label u-font-${fontSize}${inline ? " cms-inline-input-label" : ""}`}>
        <span className={`${context}-input-text u-font-${labelFontSize || fontSize}${label && labelHidden ? " u-visually-hidden" : "" }`}>
          {label}
        </span>

        <input
          className={`${context}-input u-font-${fontSize}`}
          value={value}
          onChange={onChange}
          name={name}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          tabIndex={disabled ? "-1" : null}
          type={type === "password" && showPassword === true ? "text" : type}
        />

        {type === "password" &&
          <Button
            onClick={() => this.setState({showPassword: !showPassword})}
            context={context}
            icon={showPassword ? "eye-off" : "eye-open"}
            fontSize="xs"
            iconOnly
            type="button"
          >
            {showPassword ? "hide password" : "reveal password"}
          </Button>
        }
      </label>
    );
  }
}

TextInput.defaultProps = {
  fontSize: "sm",
  context: "cp",
  label: "missing `label` prop in TextInput.jsx"
};
