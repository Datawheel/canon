import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import BaseSelect from "./CustomSelect/BaseSelect";
import DeepList from "./LevelDeepList";
import VirtualList from "./VirtualList";
import {composePropertyName} from "../../helpers/formatting";

class NewLevelSelect extends BaseSelect {
  itemListComposer(levels) {
    const nope = {hierarchy: {}};
    const hasQuery = Boolean(this.state.query);

    return levels.reduce((all, level, i, levels) => {
      const prevLevel = levels[i - 1] || nope;

      const prevDimension = prevLevel.hierarchy.dimension;
      const currDimension = level.hierarchy.dimension;

      if (hasQuery && prevDimension !== currDimension) {
        all.push(currDimension);
      }

      all.push(level);
      return all;
    }, []);
  }

  renderTarget(item) {
    const valueLabel = composePropertyName(item);
    return (
      <div className="select-item select-option option-level current" title={valueLabel}>
        <span className="select-value">
          <span className="select-label">{valueLabel}</span>
        </span>
        <span className="bp3-icon-standard bp3-icon-double-caret-vertical" />
      </div>
    );
  }

  renderPopover(items) {
    const props = this.props;
    const ListComponent = this.state.query ? VirtualList : DeepList;

    return (
      <div className="select-popover-content">
        {props.filterable && this.renderFilterInput()}
        <ListComponent
          items={items}
          value={props.value}
          showDimensions={props.showDimensions}
          itemRenderer={this.renderListItem.bind(this)}
          itemMinSize={30}
          height={270}
          onSelect={this.handleItemSelect}
        />
      </div>
    );
  }

  renderListItem(item, params) {
    const props = this.props;

    if (item.hierarchies) {
      return (
        <li className="virtlist-title" key={item.name} style={params.style}>
          <span className="topic" title={item.name}>
            {item.name}
          </span>
        </li>
      );
    }

    return (
      <li key={item.fullName} style={params.style}>
        <button
          tabIndex="0"
          type="button"
          className={classnames("bp3-menu-item select-item", {
            "bp3-active": params.isActive
          })}
          onClick={params.handleClick}
        >
          <span className="select-label">{item.name}</span>
        </button>
      </li>
    );
  }
}

NewLevelSelect.displayName = "LevelSelect";

NewLevelSelect.defaultProps = {
  ...BaseSelect.defaultProps,
  inputProps: {autoFocus: true},
  itemMinHeight: 30,

  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^|]+");
    const queryTester = RegExp(query || ".", "i");
    return items.filter(lvl =>
      queryTester.test(`${lvl.caption || lvl.name}|${lvl.hierarchy.dimension.name}`)
    );
  }
};

export default NewLevelSelect;
