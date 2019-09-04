import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./FilterSearch.css";

/** an input with a filter icon */
export default class FilterSearch extends Component {
  render() {
    const {
      context,  // "cp" (default) or "cms"
      fontSize,
      label,    // used for placeholder text and label, for accessibility
      value,    // input value
      onChange, // callback function; listen for value changes
      onReset   // callback function; close the search
    } = this.props;

    return (
      <label className={`${context}-filter-search`}>
        <span className={`u-visually-hidden ${context}-filter-search-text`}>{label}</span>
        <input
          key="filter-input"
          className={`${context}-filter-search-input u-font-${fontSize}`}
          placeholder={label || "missing 'label' prop in FilterSearch.jsx"}
          value={value}
          onChange={onChange}
          ref={this.input}
        />

        {/* search icon */}
        <Icon className={`${context}-filter-search-icon`} icon="filter" />

        {/* close button */}
        <button className={`${context}-filter-search-close-button`} tabIndex={ value && value.length ? 0 : -1 } onClick={onReset}>
          <span className="u-visually-hidden">reset search</span>
          <Icon className={`${context}-filter-search-close-button-icon`} icon="cross" />
        </button>
      </label>
    );
  }
}

FilterSearch.defaultProps = {
  context: "cp",
  fontSize: "sm"
};
