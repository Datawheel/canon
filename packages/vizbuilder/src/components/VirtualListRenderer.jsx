import {Menu} from "@blueprintjs/core";
import classnames from "classnames";
import React, {Component} from "react";
import WindowedList from "react-windowed-list";

/**
 * @template T
 * @typedef OwnProps
 * @property {string} [className]
 * @property {() => React.ReactNode} noResults
 * @property {(item: T, index: number) => boolean} [itemDisabled]
 * @property {import("@blueprintjs/select").ItemRenderer<T>} itemRenderer
 * @property {(item: T, evt?: React.SyntheticEvent<HTMLElement> | undefined) => void} onItemSelect
 */

/**
 * @template T
 * @extends {Component<import("@blueprintjs/select").IItemListRendererProps<T> & OwnProps<T>>}
 */
class VirtualListRenderer extends Component {
  render() {
    const {className, filteredItems, noResults} = this.props;

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

  /**
   * @param {number} index
   * @param {string} key
   */
  renderItem = (index, key) => {
    const props = this.props;
    const item = props.filteredItems[index];
    return props.itemRenderer(item, {
      handleClick: evt => this.itemSelectHandler(item, evt),
      index,
      key,
      modifiers: {
        active: props.activeItem === item,
        disabled: isItemDisabled(item, index, props.itemDisabled),
        matchesPredicate: props.filteredItems.indexOf(item) > -1
      },
      query: props.query,
      style: {}
    });
  };

  /**  @type {(item: T, evt?: React.SyntheticEvent<HTMLElement> | undefined) => void} */
  itemSelectHandler = (item, evt) => {
    const {onItemSelect} = this.props;
    typeof onItemSelect === "function" && onItemSelect(item, evt);
  };
}

/**
 * @template T
 * @param {T} item
 * @param {number} index
 * @param {((item: T, index: number) => boolean) | undefined} [itemDisabled]
 */
function isItemDisabled(item, index, itemDisabled) {
  // eslint-disable-next-line eqeqeq
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
  noResults: function NoResults() {
    return <span>No results</span>;
  }
};

export default VirtualListRenderer;
