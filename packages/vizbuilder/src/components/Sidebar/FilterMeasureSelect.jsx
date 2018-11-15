import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {BaseMonoSelect} from "./CustomSelect";

import {composePropertyName} from "../../helpers/formatting";

class FilterMeasureSelect extends BaseMonoSelect {
  renderTarget(item) {
    const name = composePropertyName(item);
    return (
      <div
        className="select-item select-option option-filtermeasure current"
        title={name}
      >
        <span className="select-value">
          <span className="select-label">{name}</span>
        </span>
        <span className="pt-icon-standard pt-icon-double-caret-vertical" />
      </div>
    );
  }
}

FilterMeasureSelect.displayName = "FilterMeasureSelect";

FilterMeasureSelect.defaultProps = {
  ...BaseMonoSelect.defaultProps,
  defaultValue: {value: null, name: "Select...", disabled: true},
  itemListPredicate(query, items) {
    query = escapeRegExp(`${query}`.trim()).replace(/\s+/g, ".+") || ".";
    const tester = RegExp(query, "i");
    return items.filter(item => tester.test(composePropertyName(item)));
  },
  itemRenderer({handleClick, isActive, item, style}) {
    const name = composePropertyName(item);
    return (
      <div
        className={classnames("select-option", "option-filtermeasure", {
          active: isActive,
          disabled: item.disabled
        })}
        style={style}
        onClick={handleClick}
        title={name}
      >
        <span className="select-value">
          <span className="select-label">{name}</span>
        </span>
      </div>
    );
  }
};

export default FilterMeasureSelect;
