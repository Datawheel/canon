import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import MultiLevelSelect from "./MultiLevelSelect";
import {composePropertyName} from "../../helpers/formatting";

class LevelSelect extends MultiLevelSelect {
  renderTarget(item) {
    const valueLabel = composePropertyName(item);
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
    return 26;
  },
  itemListPredicate(query, levels) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return levels.filter(lvl =>
      tester.test(
        `${lvl.caption || lvl.name} ${lvl.hierarchy.dimension.name}`
      )
    );
  },
  itemListComposer(levels) {
    const nope = {hierarchy:{}};
    return levels.reduce((all, level, i, levels) => {
      const prevLevel = levels[i - 1] || nope;
      const prevDimension = prevLevel.hierarchy.dimension;
      const currDimension = level.hierarchy.dimension;
      if (prevDimension !== currDimension) {
        all.push(currDimension);
      }
      all.push(level)
      return all;
    }, []);
  },
  itemRenderer({style, handleClick, item, isActive}) {
    const isHeader = Boolean(item.cube);

    const props = {
      key: item.annotations._key,
      style,
      onClick: !isHeader && handleClick,
      title: item.name,
      className: classnames(
        "select-level",
        isHeader ? "select-optgroup" : "select-option",
        isHeader ? `level-1` : "level-last",
        {
          active: isActive,
          disabled: item.disabled
        }
      )
    }

    const child = <span className="select-label">{item.name}</span>;

    return React.createElement('li', props, child);
  }
};

export default LevelSelect;
