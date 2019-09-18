import React from "react";
import {Button, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import escapeRegExp from "lodash/escapeRegExp";

class UpdatedCubeMeasuresSelect extends React.Component {
  constructor(props) {
    super(props);

    this.renderItem = this.renderItem.bind(this);
    this.itemSelectHandler = this.itemSelectHandler.bind(this);
  }

  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items.filter(item => queryTester.test(item.annotations._searchIndex));
  }

  render() {
    const {activeItem, disabled, items} = this.props;
    const popoverProps = {
      boundary: "viewport",
      minimal: true,
      targetTagName: "div",
      wrapperTagName: "div"
    };

    return (
      <Select
        activeItem={activeItem}
        disabled={disabled}
        itemListPredicate={this.itemListPredicate}
        itemRenderer={this.renderItem}
        items={items}
        onItemSelect={this.itemSelectHandler}
        popoverProps={popoverProps}
        resetOnClose={true}
      >
        <Button
          alignText="left"
          className="measure-select select-option active"
          fill={true}
          rightIcon="double-caret-vertical"
          text={activeItem ? activeItem.name : "Select..."}
        />
      </Select>
    );
  }

  renderItem(item, {handleClick, index, modifiers, query}) {
    return (
      <MenuItem
        className="measure-select option"
        disabled={modifiers.disabled}
        key={item.name}
        onClick={handleClick}
        text={item.name}
        title={item.name}
      />
    );
  }

  itemSelectHandler(item, evt) {
    const {onItemSelect} = this.props;
    onItemSelect && onItemSelect(item, evt);
  }
}

export default UpdatedCubeMeasuresSelect;
