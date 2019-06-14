import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import {Icon} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";

import {composePropertyName} from "../../helpers/formatting";

function FilterMeasureSelect(props) {
  let item;

  if (!props.value || typeof props.value !== "object") {
    item = props.defaultOption;
  }
  else {
    const valueName = props.value.name;
    item = props.items.find(item => item.name === valueName) || props.defaultOption;
  }

  const name = composePropertyName(item);

  return React.createElement(
    Select,
    {
      ...props,
      className: "select-wrapper select-filtermeasure",
      value: item
    },
    <div className="select-item select-option option-filtermeasure current" title={name}>
      <span className="select-value">
        <span className="select-label">{name}</span>
      </span>
      <Icon icon="double-caret-vertical" />
    </div>
  );
}

FilterMeasureSelect.defaultProps = {
  defaultOption: {value: null, name: "Select...", disabled: true},
  items: [],
  itemListPredicate(query, items) {
    query = escapeRegExp(`${query}`.trim()).replace(/\s+/g, ".+") || ".";
    const tester = RegExp(query, "i");
    return items.filter(item => tester.test(composePropertyName(item)));
  },
  itemRenderer({handleClick, item, isActive}) {
    const name = composePropertyName(item);
    return (
      <div
        className={classnames("select-option", "option-filtermeasure", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={handleClick}
        title={name}
      >
        <span className="select-value">
          <span className="select-label">{name}</span>
        </span>
      </div>
    );
  },
  noResults: <span className="select-noresults">No results</span>,
  popoverProps: {
    inline: true,
    modifiers: {
      preventOverflow: {
        boundariesElement: "viewport"
      }
    },
    popoverClassName: "select-popover bp3-minimal"
  }
};

export default FilterMeasureSelect;
