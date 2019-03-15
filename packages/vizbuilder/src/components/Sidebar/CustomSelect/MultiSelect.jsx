import React from "react";
import classNames from "classnames";
import {TagInput} from "@blueprintjs/labs";

import BaseSelect from "./BaseSelect";
import VirtualListWrapper from "./VirtualListWrapper";

class MultiSelect extends BaseSelect {
  constructor(props) {
    super(props);
    this.handleRemoveTag = this.handleRemoveTag.bind(this);
  }

  handleRemoveTag(tagName, index) {
    const props = this.props;
    const item = props.value[index];
    item && props.onItemRemove(item);
  }

  renderTarget(value) {
    const props = this.props;
    const {query} = this.state;

    const values = value.map(props.tagRenderer);

    const inputProps = {
      placeholder: "Search...",
      ...props.inputProps,
      ...props.tagInputProps.inputProps,
      onChange: this.handleQueryInput,
      ref: this.refHandlers.input,
      value: query
    };

    if (this.rightElement) {
      inputProps.rightElement = this.rightElement.call(this, value);
    }

    return (
      <TagInput
        {...props.tagInputProps}
        className={classNames(
          "select-taginput pt-fill",
          props.tagInputProps.className
        )}
        onAdd={props.onItemSelect}
        onRemove={this.handleRemoveTag}
        inputProps={inputProps}
        values={values}
      />
    );
  }

  renderPopover(items) {
    const props = this.props;

    const lastValue = props.value.slice().pop();
    const valueIndex = props.findIndex(items, lastValue);

    return (
      <div className="select-popover-content">
        <VirtualListWrapper
          className="select-list-wrapper"
          findIndex={props.findIndex}
          getItemHeight={props.getItemHeight}
          itemMinSize={props.itemMinHeight}
          itemRenderer={props.itemRenderer}
          items={items}
          minHeight={props.minHeight}
          noResults={props.noResults}
          onItemClick={this.handleItemSelect}
          scrollToIndex={Math.max(0, valueIndex)}
          sticky={props.sticky}
          value={props.value}
        />
      </div>
    );
  }
}

MultiSelect.displayName = "MultiSelect";

MultiSelect.defaultProps = {
  ...BaseSelect.defaultProps,
  closeOnSelect: false,
  itemMinHeight: 10,
  popoverProps: {
    openOnTargetFocus: false
  },
  tagInputProps: {
    inputProps: {}
  },
  tagRenderer: undefined
};

export default MultiSelect;
