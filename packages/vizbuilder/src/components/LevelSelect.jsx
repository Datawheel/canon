import {Button, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import classNames from "classnames";
import memoizeOne from "memoize-one";
import React, {Component} from "react";
import {levelNameFormatter} from "../helpers/format";
import {arrayToPropertySet} from "../helpers/transform";
import CategoryListRenderer from "./CategoryListRenderer";

/**
 * @typedef OwnProps
 * @property {boolean} [disabled]
 * @property {(item: LevelItem, event?: React.SyntheticEvent<HTMLElement>) => any} onItemSelect
 * @property {LevelItem | undefined} [selectedItem]
 * @property {LevelItem[]} options
 * @property {string} [placeholder]
 */

/** @extends {Component<OwnProps, {}>} */
class LevelSelect extends Component {
  categoryListComposer = memoizeOne(
    /**
     * @param {string[]} stack
     * @param {LevelItem[]} items
     * @returns {string[] | LevelItem[]}
     */
    (stack, items) => {
      const depth = stack.length;

      if (depth === 0) {
        return arrayToPropertySet(items, "dimension").sort();
      }

      const [dimension] = stack;
      return items.filter(item => item.dimension === dimension);
    }
  );

  /** @type {(item: LevelItem, event?: React.SyntheticEvent<HTMLElement> | undefined) => void} */
  itemSelectHandler = (item, evt) => {
    const {onItemSelect} = this.props;
    typeof onItemSelect === "function" && onItemSelect(item, evt);
  };

  render() {
    const {disabled, options, placeholder = "Select...", selectedItem: item} = this.props;

    const targetText = item
      ? levelNameFormatter(item.dimension, item.hierarchy, item.name)
      : placeholder;

    return (
      <Select
        disabled={disabled}
        filterable={false}
        itemListRenderer={this.renderItemList}
        itemRenderer={this.renderItem}
        items={options}
        onItemSelect={this.itemSelectHandler}
        popoverProps={{
          boundary: "viewport",
          minimal: true,
          targetTagName: "div",
          wrapperTagName: "div"
        }}
      >
        <Button
          alignText="left"
          className="measure-select select-option active"
          disabled={disabled}
          fill
          rightIcon="double-caret-vertical"
          text={targetText}
          title={targetText}
        />
      </Select>
    );
  }

  /** @type {import("@blueprintjs/select").ItemListRenderer<LevelItem>} */
  renderItemList = listProps => {
    return (
      <CategoryListRenderer
        {...listProps}
        itemListComposer={this.categoryListComposer}
        maxDepth={1}
      />
    );
  };

  /** @type {import("@blueprintjs/select").ItemRenderer<LevelItem>} */
  renderItem = (item, {handleClick, index, modifiers, query}) => {
    const fullName = levelNameFormatter(item.dimension, item.hierarchy, item.name);
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
  };
}

export default LevelSelect;
