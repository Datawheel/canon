import React from "react";
import classNames from "classnames";
import {Popover2} from "@blueprintjs/labs";

import BaseSelect from "./BaseSelect";
import VirtualListWrapper from "./VirtualListWrapper";

class MonoSelect extends BaseSelect {
  renderTarget(item) {
    throw new Error("User must define a renderTarget function.");
  }

  renderPopover(items) {
    const props = this.props;

    const valueIndex = props.findIndex(items, props.value);

    return (
      <div className="select-popover-content">
        {props.filterable && this.renderFilterInput()}
        <VirtualListWrapper
          className="select-list-wrapper"
          findIndex={props.findIndex}
          getItemHeight={props.getItemHeight}
          itemMinSize={props.itemMinHeight}
          itemRenderer={props.itemRenderer}
          items={items}
          noResults={props.noResults}
          onItemClick={this.handleItemSelect}
          scrollToIndex={Math.max(0, valueIndex)}
          sticky={props.sticky}
          value={props.value}
        />
      </div>
    );
  }
}

MonoSelect.displayName = "MonoSelect";

MonoSelect.defaultProps = {
  ...BaseSelect.defaultProps,
  inputProps: {
    autoFocus: true
  },
  itemMinHeight: 10,
  itemRenderer({style, handleClick, isActive, item}) {
    const props = {
      className: classNames("select-option", {active: isActive}),
      key: item.annotations._key,
      onClick: handleClick,
      style,
      title: item.name,
    };
    const child = <span className="select-label">{item.name}</span>;
    return React.createElement("div", props, child);
  },
  value: []
};

export default MonoSelect;
