import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import React from "react";
import {captionOrName, composePropertyName} from "../../helpers/formatting";
import MultiLevelSelect from "./MultiLevelSelect";

class LevelSelect extends MultiLevelSelect {
  renderTarget(item) {
    const valueLabel = composePropertyName(item);
    return (
      <div className="select-item select-option option-level current" title={valueLabel}>
        <span className="select-value">
          <span className="select-label">{valueLabel}</span>
        </span>
        <span className="pt-icon-standard pt-icon-double-caret-vertical" />
      </div>
    );
  }
}

LevelSelect.displayName = "LevelSelect";
LevelSelect.defaultProps = {
  ...MultiLevelSelect.defaultProps,
  getItemHeight() {
    return 26;
  },
  itemListPredicate(query, levels) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return levels.filter(lvl =>
      tester.test(`${captionOrName(lvl)} ${captionOrName(lvl.hierarchy.dimension)}`)
    );
  },
  itemListComposer(levels) {
    const nope = {hierarchy: {}};
    return levels.reduce((all, level, i, levels) => {
      const prevLevel = levels[i - 1] || nope;
      const prevDimension = prevLevel.hierarchy.dimension;
      const currDimension = level.hierarchy.dimension;
      if (prevDimension !== currDimension) {
        all.push(currDimension);
      }
      all.push(level);
      return all;
    }, []);
  },
  itemRenderer({style, handleClick, item, isActive}) {
    const isHeader = Boolean(item.cube);

    const childClassName = classnames("select-label", {h1: isHeader});
    const child = <span className={childClassName}>{captionOrName(item)}</span>;

    return React.createElement(
      "div",
      {
        key: item.annotations._key,
        style,
        onClick: !isHeader && handleClick,
        title: captionOrName(item),
        className: classnames(
          "select-item",
          isHeader ? "select-optgroup" : "select-option",
          "option-level",
          {
            active: isActive,
            disabled: item.disabled
          }
        )
      },
      child
    );
  }
};

export default LevelSelect;
