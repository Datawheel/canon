import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import MultiLevelSelect from "./MultiLevelSelect";

class LevelSelect extends MultiLevelSelect {
  renderTarget(item) {
    const valueLabel = item.caption || item.name;
    return (
      <div className="select-option current" title={valueLabel}>
        <span className="value">{valueLabel}</span>
        <span className="pt-icon-standard pt-icon-double-caret-vertical" />
      </div>
    );
  }
}

LevelSelect.displayName = "LevelSelect";
LevelSelect.defaultProps = {
  ...MultiLevelSelect.defaultProps,
  getItemHeight() {
    return 40;
  },
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item =>
      tester.test(
        `${item.caption || item.name} ${item.hierarchy.dimension.name}`
      )
    );
  },
  itemRenderer({handleClick, item, isActive}) {
    return (
      <li
        className={classnames("select-option", "select-level", {
          active: isActive,
          disabled: item.disabled
        })}
        onClick={item.disabled || handleClick}
        title={item.name}
      >
        <span className="select-label">{item.name}</span>
        <span className="select-label lead">
          {item.hierarchy.dimension.name}
        </span>
      </li>
    );
  }
};

export default LevelSelect;
