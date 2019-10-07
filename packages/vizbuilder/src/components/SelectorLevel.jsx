import {Button, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import {connect} from "react-redux";
import classNames from "classnames";
import memoizeOne from "memoize-one";
import React, {Component} from "react";
import {composePropertyName} from "../helpers/formatting";
import {selectDimensionList} from "../selectors/listsRaw";
import CategoryListRenderer from "./CategoryListRenderer";

/**
 * @typedef OwnProps
 * @property {boolean} disabled
 * @property {(item: LevelItem, event?: React.SyntheticEvent<HTMLElement>) => any} onItemSelect
 * @property {DimensionItem} selectedItem
 */

/**
 * @typedef StateProps
 * @property {DimensionItem[]} items
 */

/** @extends {Component<OwnProps&StateProps,{}>} */
class LevelSelector extends Component {
  constructor(props) {
    super(props);

    this.renderItemList = this.renderItemList.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.itemSelectHandler = this.itemSelectHandler.bind(this);
  }

  categoryListComposer = memoizeOne((stack, items) => {
    const depth = stack.length;

    if (depth === 0) {
      const dimensionMap = {};
      let n = items.length;
      while (n--) {
        const name = items[n].hierarchy.dimension.name;
        dimensionMap[name] = true;
      }
      return Object.keys(dimensionMap).sort();
    }

    const [dimension] = stack;
    return items.filter(item => item.hierarchy.dimension.name === dimension);
  });

  render() {
    const {items, selectedItem, disabled} = this.props;
    const popoverProps = {
      boundary: "viewport",
      minimal: true,
      targetTagName: "div",
      wrapperTagName: "div"
    };

    return (
      <Select
        activeItem={selectedItem}
        disabled={disabled}
        filterable={false}
        itemListRenderer={this.renderItemList}
        itemRenderer={this.renderItem}
        items={items}
        onItemSelect={this.itemSelectHandler}
        popoverProps={popoverProps}
      >
        <Button
          alignText="left"
          className="measure-select select-option active"
          fill={true}
          rightIcon="double-caret-vertical"
          text={selectedItem ? composePropertyName(selectedItem) : "Select..."}
          title={selectedItem.name}
        />
      </Select>
    );
  }

  /** @param {import("@blueprintjs/select").IItemListRendererProps} listProps */
  renderItemList(listProps) {
    return (
      <CategoryListRenderer
        {...listProps}
        itemListComposer={this.categoryListComposer}
        maxDepth={1}
      />
    );
  }

  renderItem(item, {handleClick, index, modifiers, query}) {
    const fullName = composePropertyName(item);
    return (
      <MenuItem
        className={classNames("level-select option", {active: modifiers.active})}
        disabled={modifiers.disabled}
        key={fullName}
        onClick={handleClick}
        text={item.name}
        title={fullName}
      />
    );
  }

  itemSelectHandler(item, evt) {
    const {onItemSelect} = this.props;
    onItemSelect && onItemSelect(item, evt);
  }
}

/** @type {import("react-redux").MapStateToProps<StateProps,OwnProps,GeneralState>} */
function mapState(state) {
  return {
    items: selectDimensionList(state)
  };
}

export default connect(mapState)(LevelSelector);
