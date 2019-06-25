import React, {Component} from "react";
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

    return options && options.length
      ? <label
        className={`cms-select-label font-${fontSize}${inline ? " cms-inline-select-label" : ""}`}
        value={value}
      >
        <span className={`cms-select-text${label && labelHidden ? " u-visually-hidden" : "" }`}>
          {label || "missing `label` prop in Select.jsx"}
        </span>

        <select className="cms-select" onChange={onChange}>
          {options.map(option =>
            <option value={option} key={`select-option-${option}`}>
              {option}
            </option>
          )}
          {children}
        </select>
      </label>
      : "missing or malformed `options` prop in Select.jsx (array expected)";
  }
}

Select.defaultProps = {
  fontSize: "sm"
};
