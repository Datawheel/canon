/* eslint-disable func-style */
import {Button} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import escapeRegExp from "lodash/escapeRegExp";
import React from "react";
import {levelNameFormatter} from "../helpers/format";
import FilterList from "./FilterList";
import {MenuItem} from "./MenuItem";
import NavigationList from "./NavigationList";

/**
 * @typedef OwnProps
 * @property {LevelItem[]} items
 * @property {(item: LevelItem, event?: React.SyntheticEvent<HTMLElement> | undefined) => void} onItemSelect
 * @property {string} placeholder
 * @property {LevelItem | undefined} selectedItem
 */

/** @type {React.FC<OwnProps>} */
const LevelSelect = function({
  items,
  onItemSelect,
  placeholder = "Select...",
  selectedItem
}) {
  const targetText = selectedItem
    ? levelNameFormatter(selectedItem.dimension, selectedItem.hierarchy, selectedItem.name)
    : placeholder;

  return (
    <Select
      itemListPredicate={itemListPredicate}
      itemListRenderer={renderItemList}
      itemRenderer={renderItem}
      items={items}
      onItemSelect={onItemSelect}
      popoverProps={{boundary: "viewport", fill: true, minimal: true}}
    >
      <Button
        alignText="left"
        className="level-select select-option active"
        fill={true}
        rightIcon="double-caret-vertical"
        title={targetText}
      >
        {targetText}
      </Button>
    </Select>
  );
};

/** @type {import("@blueprintjs/select").ItemListPredicate<LevelItem>} */
function itemListPredicate(query, items) {
  query = query.trim();
  query = escapeRegExp(query).replace(/\s+/g, "[^|]+");
  const queryTester = RegExp(query || ".", "i");
  return items.filter(item => queryTester.test(item.caption));
}

/** @type {import("@blueprintjs/select").ItemRenderer<LevelItem>} */
function renderItem(item, {handleClick, modifiers}) {
  return (
    <MenuItem
      active={modifiers.active}
      className="level-select option"
      disabled={modifiers.disabled}
      key={item.uri}
      onClick={handleClick}
      text={item.name}
    />
  );
}

const levelGetter = [d => d.dimension, d => d.hierarchy];

/** @type {import("@blueprintjs/select").ItemListRenderer<LevelItem>} */
function renderItemList(itemListProps) {
  return itemListProps.query
    ? <FilterList {...itemListProps} levels={levelGetter} />
    : <NavigationList {...itemListProps} levels={levelGetter} />
  ;
}

export default LevelSelect;
