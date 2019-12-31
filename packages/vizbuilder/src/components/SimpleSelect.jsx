/* eslint-disable func-style */
import React from "react";
import {Select} from "@blueprintjs/select";
import {Button, MenuItem, Position} from "@blueprintjs/core";
import {fuzzySearch} from "../helpers/find";

/**
 * @template {BaseItem} T
 * @typedef OwnProps
 * @property {string} [className]
 * @property {boolean} [filterable]
 * @property {import("@blueprintjs/select").ItemListPredicate<T>} [itemListPredicate]
 * @property {import("@blueprintjs/select").ItemRenderer<T>} [itemRenderer]
 * @property {(item: T, event?: React.SyntheticEvent<HTMLElement>) => void} onItemSelect
 * @property {T[]} options
 * @property {string} [placeholder]
 * @property {T | undefined} [selectedItem]
 */

/**
 * @template {BaseItem} T
 * @type {React.FC<OwnProps<T>>}
 */
const SimpleSelect = function SimpleSelect({
  className,
  itemListPredicate,
  itemRenderer,
  onItemSelect,
  options,
  placeholder,
  selectedItem,
  filterable = options.length > 6
}) {
  return (
    <Select
      className={className}
      filterable={filterable}
      itemListPredicate={itemListPredicate}
      itemRenderer={itemRenderer}
      items={options}
      onItemSelect={onItemSelect}
      popoverProps={{boundary: "viewport", fill: true, minimal: true}}
    >
      <Button
        alignText={Position.LEFT}
        fill={true}
        text={selectedItem ? selectedItem.caption : placeholder}
      />
    </Select>
  );
};

SimpleSelect.defaultProps = {
  itemListPredicate: (query, items) => fuzzySearch(items, query, "name"),
  // eslint-disable-next-line react/display-name
  itemRenderer: (item, {handleClick, modifiers}) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={item.uri}
        onClick={handleClick}
        text={item.caption}
      />
    );
  }
};

export default SimpleSelect;
