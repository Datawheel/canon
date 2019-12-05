import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./FilterSearch.css";

/** an input with a filter icon */
export default class FilterSearch extends Component {
  render() {
    const {
      namespace, // "cp" (default) or "cms"
      fontSize,
      label,     // used for placeholder text and label, for accessibility
      value,     // input value
      onChange,  // callback function; listen for value changes
      onReset    // callback function; close the search
    } = this.props;

    return (
      <label className={`${namespace}-filter-search`}>
        <span className={`u-visually-hidden ${namespace}-filter-search-text`}>{label}</span>
        <input
          key="filter-input"
          className={`${namespace}-filter-search-input u-font-${fontSize}`}
          placeholder={label || "missing 'label' prop in FilterSearch.jsx"}
          value={value}
          onChange={onChange}
          ref={this.input}
        />

        {/* search icon */}
        <Icon className={`${namespace}-filter-search-icon`} icon="filter" />

        {/* close button */}
        <button className={`${namespace}-filter-search-close-button`} tabIndex={ value && value.length ? 0 : -1 } onClick={onReset}>
          <span className="u-visually-hidden">reset search</span>
          <Icon className={`${namespace}-filter-search-close-button-icon`} icon="cross" />
        </button>
      </label>
    );
  }
}

FilterSearch.defaultProps = {
  namespace: "cp",
  fontSize: "sm"
};
