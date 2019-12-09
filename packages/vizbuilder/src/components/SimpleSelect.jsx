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
 * @property {import("@blueprintjs/select").ItemRenderer<T>} [itemListRenderer]
 * @property {(item: T, event?: React.SyntheticEvent<HTMLElement>) => void} onItemSelect
 * @property {T[]} options
 * @property {string} placeholder
 * @property {T | undefined} [selectedItem]
 */

/**
 * @template {BaseItem} T
 * @type {React.FC<OwnProps<T>>}
 */
const SimpleSelect = function SimpleSelect({
  className,
  itemListPredicate,
  itemListRenderer,
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
      itemRenderer={itemListRenderer}
      items={options}
      onItemSelect={onItemSelect}
      popoverProps={{
        boundary: "viewport",
        minimal: true,
        targetTagName: "div",
        wrapperTagName: "div"
      }}
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
  itemListPredicate: (query, levels) => fuzzySearch(levels, query, "name"),
  // eslint-disable-next-line react/display-name
  itemListRenderer: (level, {handleClick, modifiers}) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={level.uri}
        onClick={handleClick}
        text={level.caption}
      />
    );
  }
};

export default SimpleSelect;
