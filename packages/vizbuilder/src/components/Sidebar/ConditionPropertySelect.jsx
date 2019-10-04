import {Icon} from "@blueprintjs/core";
import {Select} from "@blueprintjs/labs";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import React from "react";
import {captionOrName, composePropertyName} from "../../helpers/formatting";

function FilterMeasureSelect(props) {
  const selectedItem = props.value;
  let item;

  if (!selectedItem || typeof selectedItem !== "object") {
    item = props.defaultOption;
  }
  else {
    const valueName = captionOrName(selectedItem);
    item =
      props.items.find(item => captionOrName(item) === valueName) || props.defaultOption;
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
      <Icon iconName="double-caret-vertical" />
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
    popoverClassName: "select-popover pt-minimal"
  }
};

export default FilterMeasureSelect;
