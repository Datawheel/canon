import React from "react";
import classNames from 'classnames';
import {Popover2} from "@blueprintjs/labs";

import VirtualListWrapper from "./VirtualListWrapper";

import "./_MultiLevelSelect.css";

class MultiLevelSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: ""
    };

    this.handleQueryInput = this.handleQueryInput.bind(this);
    this.handleQueryReset = this.handleQueryInput.bind(this, {
      target: {value: ""}
    });
  }

  handleQueryInput(evt) {
    this.setState({query: `${evt.target.value}`.trim()});
  }

  getItemHeight(item) {
    throw new Error("User must define a getItemHeight function.");
  }

  renderTarget(item) {
    throw new Error("User must define a renderTarget function.");
  }

  renderPopover() {
    const {
      itemListComposer,
      itemListPredicate,
      itemRenderer,
      items,
      noResults,
      onItemSelect,
      value
    } = this.props;
    const {query} = this.state;

    const filteredItems = query ? itemListPredicate(query, items) : items;
    const composedItems = itemListComposer(filteredItems);

    return (
      <div className="mlsel-popover-content">
        <div className="pt-input-group mlsel-filter-group">
          <input
            className="pt-input pt-fill mlsel-filter-input"
            type="text"
            placeholder="Type to filter elements..."
            dir="auto"
            value={query}
            onInput={this.handleQueryInput}
          />
          <button
            className="pt-button pt-minimal pt-icon-cross mlsel-filter-reset"
            onClick={this.handleQueryReset}
          />
        </div>

        <VirtualListWrapper
          className="mlsel-select-list"
          items={composedItems}
          value={[].concat(value)}
          itemRenderer={itemRenderer}
          onItemClick={onItemSelect}
          noResults={noResults}
          getItemHeight={this.getItemHeight}
        />
      </div>
    );
  }

  renderSingle() {
    const props = this.props;
    const popContent = this.renderPopover.call(this);
    const item = props.value || props.defaultOption;

    return (
      <Popover2
        {...props.popoverProps}
        placement="bottom-start"
        content={popContent}
        className={classNames("mlsel-target-wrapper pt-fill", props.className)}
      >
        {this.renderTarget(item)}
      </Popover2>
    );
  }

  renderMulti() {
    // TODO
    return <span>Multi</span>;
  }

  render() {
    return this.props.multiple
      ? this.renderMulti.call(this)
      : this.renderSingle.call(this);
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
