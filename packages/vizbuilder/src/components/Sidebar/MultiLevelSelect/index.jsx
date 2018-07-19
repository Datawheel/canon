import React from "react";
import classNames from "classnames";
import {Popover2} from "@blueprintjs/labs";

import VirtualListWrapper from "./VirtualListWrapper";

import "./style.css";

class MultiLevelSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      query: ""
    };

    this.handleItemSelect = this.handleItemSelect.bind(this);
    this.handlePopoverInteraction = this.handlePopoverInteraction.bind(this);
    this.handleQueryInput = this.handleQueryInput.bind(this);
    this.handleQueryReset = this.handleQueryInput.bind(this, {
      target: {value: ""}
    });
  }

  handleItemSelect(item, event) {
    this.setState({isOpen: false});
    const {onItemSelect, resetOnSelect} = this.props;
    resetOnSelect && this.handleQueryReset();
    typeof onItemSelect === "function" && onItemSelect(item, event);
  }

  handlePopoverInteraction(isOpen) {
    this.setState({isOpen});

    const popoverProps = this.props.popoverProps || {};
    const {onInteraction} = popoverProps;
    typeof onInteraction === "function" && onInteraction(isOpen);
  }

  handleQueryInput(evt) {
    this.setState({query: `${evt.target.value}`.trim()});
  }

  maybeRenderResetButton() {
    return this.state.query.length
      ? <button
        className="pt-button pt-minimal pt-icon-cross mlsel-filter-reset"
        onClick={this.handleQueryReset}
      />
      : null;
  }

  renderTarget(item) {
    throw new Error("User must define a renderTarget function.");
  }

  renderPopover() {
    const {
      filterable,
      getItemHeight,
      itemListComposer,
      itemListPredicate,
      itemRenderer,
      items,
      noResults,
      value
    } = this.props;
    const {query} = this.state;

    const filteredItems = query ? itemListPredicate(query, items) : items;
    const composedItems = itemListComposer(filteredItems);

    return (
      <div className="mlsel-popover-content">
        {filterable &&
          <div className="pt-input-group mlsel-filter-group">
            <span className="pt-icon pt-icon-search" />
            <input
              className="pt-input pt-fill mlsel-filter-input"
              type="text"
              placeholder="Type to filter elements..."
              dir="auto"
              value={query}
              onInput={this.handleQueryInput}
            />
            {this.maybeRenderResetButton.call(this)}
          </div>
        }

        <VirtualListWrapper
          className="mlsel-select-list"
          items={composedItems}
          value={[].concat(value)}
          itemRenderer={itemRenderer}
          onItemClick={this.handleItemSelect}
          noResults={noResults}
          getItemHeight={getItemHeight}
        />
      </div>
    );
  }

  render() {
    const props = this.props;
    const popContent = this.renderPopover.call(this);
    const item = props.value || props.defaultOption;

    return (
      <Popover2
        isOpen={this.state.isOpen}
        placement="bottom-start"
        disabled={props.disabled}
        {...props.popoverProps}
        content={popContent}
        className={classNames("mlsel-target-wrapper pt-fill", props.className)}
        onInteraction={this.handlePopoverInteraction}
      >
        {this.renderTarget(item)}
      </Popover2>
    );
  }
}

MultiLevelSelect.defaultProps = {
  filterable: true,
  caret: "double-caret-vertical",
  defaultOption: {name: "Select...", disabled: true},
  popoverProps: {
    modifiers: {
      preventOverflow: {
        boundariesElement: "viewport"
      }
    },
    popoverClassName: "pt-select-popover base-select mlsel-popover pt-minimal"
  },
  noResults: <span className="select-noresults">No results</span>,
  value: []
};

export default MultiLevelSelect;
