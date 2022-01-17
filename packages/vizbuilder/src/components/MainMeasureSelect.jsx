/* eslint-disable func-style */
import {Button, Tag} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import escapeRegExp from "lodash/escapeRegExp";
import React, {useMemo} from "react";
import FilterList from "./FilterList";
import {MenuItem} from "./MenuItem";
import NavigationList from "./NavigationList";

/**
 * @typedef OwnProps
 * @property {string} className
 * @property {MeasureItem[]} items
 * @property {(item: MeasureItem, event?: React.SyntheticEvent<HTMLElement> | undefined) => void} onItemSelect
 * @property {string} [placeholder]
 * @property {MeasureItem} selectedItem
 * @property {Record<string, MeasureItem[]>} tableMap
 */

/** @type {React.FC<OwnProps>} */
const MainMeasureSelect = function({
  className,
  items,
  onItemSelect,
  placeholder = "Select...",
  selectedItem,
  tableMap
}) {
  // Adds the item only if it wasn't added from another dataset previously
  const tableUniqueItems = useMemo(
    () => {
      const tableRecord = {};
      return items.filter(({tableId, uri}) => {
        if (tableId && tableId in tableMap) {
          const tableMeasures = tableMap[tableId];
          const isTableRecorded = tableRecord[tableId];
          if (isTableRecorded !== true) {
            tableRecord[tableId] = true;
            const isSelectedInTable = tableMeasures.indexOf(selectedItem) > -1;
            if (isSelectedInTable) {
              return uri === selectedItem.uri;
            }
            return true;
          }
          return false;
        }
        return true;
      });
    },
    [items, selectedItem]
  );

  const target = selectedItem
    ? <MeasureOption name={selectedItem.name}>
      <span className="source">{selectedItem.sourceName}</span>
    </MeasureOption>
    : placeholder;

  return (
    <Select
      className={className}
      itemListPredicate={itemListPredicate}
      itemListRenderer={renderItemList}
      itemRenderer={renderItem}
      items={tableUniqueItems}
      onItemSelect={onItemSelect}
      popoverProps={{fill: true, minimal: true, boundary: "viewport"}}
    >
      <Button
        alignText="left"
        className="measure-select select-option active"
        fill={true}
        rightIcon="double-caret-vertical"
        title={selectedItem ? selectedItem.name : placeholder}
      >
        {target}
      </Button>
    </Select>
  );
};

/** @type {React.FC<{name: string}>} */
const MeasureOption = function(props) {
  return (
    <span className="measure-label">
      <span className="name">{props.name}</span>
      {props.children}
    </span>
  );
};

/** @type {import("@blueprintjs/select").ItemListPredicate<MeasureItem>} */
function itemListPredicate(query, items) {
  query = query.trim();
  query = escapeRegExp(query).replace(/\s+/g, "[^|]+");
  const queryTester = RegExp(query || ".", "i");
  return items.filter(item => queryTester.test(item.searchIndex));
}

/** @type {import("@blueprintjs/select").ItemRenderer<MeasureItem>} */
function renderItem(item, {modifiers, handleClick}) {
  const dimNamesToRender = item.dimNames.slice(0, 4);
  if (item.dimNames.length > 4) {
    dimNamesToRender.push(`+${item.dimNames.length - 4} more`);
  }

  const content =
    <MeasureOption name={item.name}>
      <span className="dimNames">
        {dimNamesToRender.map(dim => <Tag key={dim}>{dim}</Tag>)}
      </span>
    </MeasureOption>
  ;

  return (
    <MenuItem
      active={modifiers.active}
      className="measure-select option"
      disabled={modifiers.disabled}
      key={item.uri}
      multiline={true}
      onClick={handleClick}
      text={content}
    />
  );
}

const levelGetter = [d => d.topic, d => d.subtopic];

/** @type {import("@blueprintjs/select").ItemListRenderer<MeasureItem>} */
function renderItemList(itemListProps) {
  return itemListProps.query
    ? <FilterList {...itemListProps} levels={levelGetter} />
    : <NavigationList {...itemListProps} levels={levelGetter} />
  ;
}

export default MainMeasureSelect;
