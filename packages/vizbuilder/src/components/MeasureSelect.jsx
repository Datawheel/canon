import React from "react";
import classnames from "classnames";
import {Icon} from "@blueprintjs/core";

import BaseSelect from "./BaseSelect";

import "./MeasureSelect.css";

function MeasureSelect(props) {
  return React.createElement(BaseSelect, props, props.children);
}

MeasureSelect.defaultProps = {
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
        <span className="select-option-label lead">{item.name}</span>
        <span className="select-option-label">{item.name}</span>
      </li>
    );
  }
};

export default MeasureSelect;
