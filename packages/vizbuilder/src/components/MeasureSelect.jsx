import React from "react";
import {Select} from "@blueprintjs/select";
import {Button, MenuItem, Position} from "@blueprintjs/core";
import {fuzzySearch} from "../helpers/find";

/**
 * @typedef OwnProps
 * @property {string} [className]
 * @property {boolean} [filterable]
 * @property {import("@blueprintjs/select").ItemListPredicate<MeasureItem>} [itemListPredicate]
 * @property {import("@blueprintjs/select").ItemRenderer<MeasureItem>} [itemListRenderer]
 * @property {(item: MeasureItem, event?: React.SyntheticEvent<HTMLElement>) => void} onItemSelect
 * @property {MeasureItem[]} options
 * @property {string} placeholder
 * @property {MeasureItem | undefined} [selectedItem]
 */

/** @type {React.FC<OwnProps>} */
const MeasureSelect = function({
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
      popoverProps={{targetTagName: "div", wrapperTagName: "div"}}
    >
      <Button
        alignText={Position.LEFT}
        fill={true}
        text={selectedItem ? selectedItem.caption : placeholder}
      />
    </Select>
  );
};

MeasureSelect.defaultProps = {
  itemListPredicate: (query, measures) => fuzzySearch(measures, query, "searchIndex"),
  itemListRenderer: (measure, {handleClick, modifiers}) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={measure.uri}
        onClick={handleClick}
        text={measure.caption}
      />
    );
  }
};

export default MeasureSelect;
