import {Menu} from "@blueprintjs/core";
import classnames from "classnames";
import React from "react";
import WindowedList from "react-windowed-list";

import "./VirtualListRenderer.css";

class VirtualListRenderer extends React.Component {
  render() {
    const {
      activeItem,
      className,
      filteredItems,
      itemsParentRef,
      noResults,
      query,
      renderItem
    } = this.props;

    if (!filteredItems.length) return noResults;

    return (
      <WindowedList
        className={className}
        length={filteredItems.length}
        itemRenderer={this.renderItem}
        containerRenderer={this.renderContainer}
      />
    );
  }

  renderContainer = (items, virlistRef) => {
    const {itemsParentRef} = this.props;
    const doubleRef = function(ref) {
      [virlistRef, itemsParentRef].forEach(refHandler => {
        if (typeof refHandler === "function") {
          refHandler(ref);
        }
        else {
          refHandler.current = ref;
        }
      });
    };
    return (
      <div className={classnames("virlist-wrapper", this.props.className)}>
        <Menu className="virlist-content" ulRef={doubleRef}>
          {items}
        </Menu>
      </div>
    );
  };

  renderItem = (index, key) => {
    const props = this.props;
    const item = props.filteredItems[index];
    return props.itemRenderer(item, {
      handleClick: evt => this.itemSelectHandler(item, evt),
      index,
      modifiers: {
        active: props.activeItem === item,
        disabled: isItemDisabled(item, index, props.itemDisabled),
        matchesPredicate: props.filteredItems.indexOf(item) > -1
      },
      query: props.query,
      key,
      style: {}
    });
  };

  itemSelectHandler = (item, evt) => {
    const {onItemSelect} = this.props;
    onItemSelect && onItemSelect(item, evt);
  };
}

function isItemDisabled(item, index, itemDisabled) {
  if (item == null || itemDisabled == null) {
    return false;
  }
  if (typeof itemDisabled === "function") {
    return itemDisabled(item, index);
  }
  return Boolean(item[itemDisabled]);
}

VirtualListRenderer.defaultProps = {
  items: [],
  noResults: props => <span>No results</span>
};

export default VirtualListRenderer;
