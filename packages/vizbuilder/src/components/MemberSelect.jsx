/* eslint-disable func-style */
import {Button, Intent, Spinner} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/select";
import classNames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";
import keyBy from "lodash/keyBy";
import React, {useMemo} from "react";
import FilterList from "./FilterList";
import {MenuItem} from "./MenuItem";
import NavigationList from "./NavigationList";

/**
 * @typedef OwnProps
 * @property {boolean} loading
 * @property {number} maxDepth
 * @property {() => void} onClear
 * @property {(item: MemberItem, evt?: React.SyntheticEvent<HTMLElement>) => void} onItemSelect
 * @property {(key: string, index: number) => void} onItemRemove
 * @property {MemberItem[]} items
 * @property {string[]} selectedItems
 */

/** @type {React.FC<OwnProps>} */
const MemberSelect = function({
  loading,
  onClear,
  onItemRemove,
  onItemSelect,
  items,
  selectedItems
}) {
  const tagInputProps = useMemo(
    () => ({
      onRemove(_, index) {
        typeof onItemRemove === "function" && onItemRemove(selectedItems[index], index);
      },
      rightElement: loading
        ? <Spinner size={Spinner.SIZE_SMALL} intent={Intent.PRIMARY} />
        : selectedItems.length > 0
          ? <Button icon="cross" minimal={true} onClick={onClear} />
          : undefined,
      tagProps: {minimal: true}
    }),
    [onClear, onItemRemove, selectedItems]
  );

  const actualSelectedItems = useMemo(
    () => {
      const optionMap = keyBy(items, m => m.key);
      // eslint-disable-next-line eqeqeq
      return selectedItems.map(key => optionMap[key]).filter(item => item != null);
    },
    [items, selectedItems]
  );

  return (
    <MultiSelect
      itemListPredicate={itemListPredicate}
      itemListRenderer={renderItemList}
      itemRenderer={renderItem}
      items={items}
      onItemSelect={onItemSelect}
      popoverProps={{boundary: "viewport", fill: true, minimal: true}}
      resetOnSelect={true}
      selectedItems={actualSelectedItems}
      tagInputProps={tagInputProps}
      tagRenderer={renderTag}
    />
  );
};

/** @type {import("@blueprintjs/select").ItemListPredicate<MemberItem>} */
function itemListPredicate(query, items) {
  query = query.trim();
  query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
  const queryTester = RegExp(query || ".", "i");
  return items.filter(item => queryTester.test(item.name));
}

/** @type {import("@blueprintjs/select").ItemRenderer<MemberItem>} */
function renderItem(item, {handleClick, modifiers}) {
  return (
    <MenuItem
      className={classNames("member-select option", {active: modifiers.active})}
      disabled={modifiers.disabled}
      key={item.key}
      onClick={handleClick}
      text={item.name}
    />
  );
}

/** @type {import("@blueprintjs/select").ItemListRenderer<MemberItem>} */
function renderItemList(itemListProps) {
  const firstItem = itemListProps.items[0];
  const levelGetter = firstItem ? firstItem.ancestors.map((_, index) => d => d.ancestors[index].name) : [];

  return itemListProps.query
    ? <FilterList {...itemListProps} levels={levelGetter} />
    : <NavigationList {...itemListProps} levels={levelGetter} />;
}

/** @type {(item: MemberItem) => React.ReactNode} */
function renderTag(item) {
  return item.name;
}

export default MemberSelect;
