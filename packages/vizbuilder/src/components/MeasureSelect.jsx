import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import {Icon} from "@blueprintjs/core";

import "./MeasureSelect.css";
import BaseSelect from "./BaseSelect";

function MeasureSelect(props) {
  const item = props.value || props.defaultOption;
  props.items = props.items.slice(0, 100);
  return (
    <BaseSelect {...props}>
      <div
        className="select-option select-measure current"
        title={item.name}
      >
        {item.iconName && <Icon iconName={item.iconName} />}
        <span className="value">{item.name}</span>
        <Icon iconName={props.caret} />
      </div>
    </BaseSelect>
  );
}

MeasureSelect.defaultProps = {
  itemListPredicate(query, items) {
    query = query.trim();
    const tester = RegExp(escapeRegExp(query) || ".", "i");
    return items.filter(item => tester.test(`${item.annotations._cube} ${item.caption || item.name}`));
  },
  itemRenderer({handleClick, item, isActive}) {
    return (
      <li
        className={classnames("select-option", "select-measure", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={item.disabled || handleClick}
        title={item.name}
      >
        {item.icon && <Icon iconName={item.icon} />}
        <span className="select-option-label">{item.name}</span>
        <span className="select-option-label lead">{item.annotations._cube}</span>
      </li>
    );
  },
  popoverProps: {
    popoverClassName: "select-box select-box-popover pt-minimal"
  }
};

export default MeasureSelect;
