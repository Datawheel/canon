import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import { Icon } from "@blueprintjs/core";
import { Select } from "@blueprintjs/labs";

import "@blueprintjs/labs/dist/blueprint-labs.css";

BaseSelect.defaultProps = {
  caret: "double-caret-vertical",
  defaultValue: { value: null, name: "Select...", disabled: true },
  itemListPredicate(query, items) {
    query = query.trim();
    const tester = RegExp(escapeRegExp(query) || ".", "i");
    return items.filter(item => tester.test(item.name));
  },
  itemRenderer({ handleClick, item, isActive }) {
    return (
      <span
        className={classnames("select-option", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={item.disabled || handleClick}
      >
        {item.icon && <Icon iconName={item.icon} />}
        <span className="select-option-label">{item.name}</span>
      </span>
    );
  },
  popoverProps: {
    popoverClassName: "select-popover pt-minimal"
  }
};

/**
 * @class BaseSelect
 * @extends {React.Component<BaseSelectProps>}
 * @param {object} props
 * @param {Array<any>} props.items
 * @param {(item: any, event?: Event) => void} props.onItemSelect
 * @param {any} props.value
 */
function BaseSelect(props) {
  props = {
    ...props,
    className: classnames("select-box", props.className)
  };

  const value = props.value;
  props.value =
    props.items.find(item => item.name == value.name) || props.defaultValue;

  if (!props.children)
    props.children = (
      <div className="select-option current" title={props.value.name}>
        {props.value.icon && <Icon iconName={props.value.icon} />}
        <span className="value">{props.value.name}</span>
        <Icon iconName={props.caret} />
      </div>
    );

  return React.createElement(Select, props, props.children);
}

export default BaseSelect;
