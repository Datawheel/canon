import React from "react";
import classNames from "classnames";
import {PopoverInteractionKind} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/labs";

class BaseSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      query: "",
      selectedIndex: 0
    };

    this.previousFocusedElement = undefined;
    this.input = undefined;

    this.refHandlers = {
      input: ref => {
        this.input = ref;
      }
    };

    this.handleItemSelect = this.handleItemSelect.bind(this);
    this.handlePopoverInteraction = this.handlePopoverInteraction.bind(this);
    this.handlePopoverWillOpen = this.handlePopoverWillOpen.bind(this);
    this.handlePopoverDidOpen = this.handlePopoverDidOpen.bind(this);
    this.handlePopoverWillClose = this.handlePopoverWillClose.bind(this);
    this.handleQueryReset = this.handleQueryInput.bind(this, "");
    this.handleQueryInput = this.handleQueryInput.bind(this);
  }

  handleItemSelect(item, event) {
    const props = this.props;
    props.closeOnSelect && this.setState({isOpen: false});
    props.resetOnSelect && this.handleQueryReset();

    typeof props.onItemSelect === "function" && props.onItemSelect(item, event);
  }

  handlePopoverInteraction(isOpen) {
    this.setState({isOpen});
  }

  handlePopoverWillOpen() {
    this.previousFocusedElement = document.activeElement;
  }

  handlePopoverDidOpen() {
    requestAnimationFrame(() => {
      const {inputProps} = this.props;
      if (inputProps.autoFocus !== false && this.input != null) {
        this.input.focus();
      }
    });
  }

  handlePopoverWillClose() {
    requestAnimationFrame(() => {
      if (this.previousFocusedElement !== undefined) {
        this.previousFocusedElement.focus();
        this.previousFocusedElement = undefined;
      }
      this.handleQueryReset();
    });
  }

  handleQueryInput(value) {
    if (typeof value === "object") {
      value = `${value.target.value}`;
    }
    this.setState({query: value || ""});
  }

  getOptions() {
    const props = this.props;
    const {query} = this.state;
    let items = props.items;

    const itemListPredicate = props.itemListPredicate || this.itemListPredicate;
    if (query && itemListPredicate) {
      items = itemListPredicate.call(this, query, items);
    }
    const itemListComposer = props.itemListComposer || this.itemListComposer;
    if (itemListComposer) {
      items = itemListComposer.call(this, items);
    }

    return items;
  }

  render() {
    const props = this.props;
    const options = this.getOptions.call(this);

    const value =
      props.value === undefined || props.value === null
        ? props.defaultValue
        : props.value;

    return (
      <Popover2
        autoFocus={false}
        disabled={props.disabled}
        inline={true}
        isOpen={this.state.isOpen}
        minimal={true}
        placement="bottom-start"
        {...props.popoverProps}
        className={classNames(
          "pt-fill select-target-wrapper",
          props.className
        )}
        content={this.renderPopover.call(this, options)}
        interactionKind={PopoverInteractionKind.CLICK}
        modifiers={{
          preventOverflow: {
            enabled: true,
            boundariesElement: "viewport"
          },
          ...props.popoverProps.modifiers
        }}
        onInteraction={this.handlePopoverInteraction}
        popoverClassName={classNames(
          "pt-select-popover select-popover-wrapper",
          props.popoverProps.popoverClassName,
          props.className
        )}
        popoverDidOpen={this.handlePopoverDidOpen}
        popoverWillClose={this.handlePopoverWillClose}
        popoverWillOpen={this.handlePopoverWillOpen}
      >
        {this.renderTarget.call(this, value)}
      </Popover2>
    );
  }

  renderTarget() {
    throw new Error("Select.renderTarget must be overriden by the user.");
  }

  renderPopover() {
    throw new Error("Select.renderPopover must be overriden by the user.");
  }

  renderFilterInput() {
    const {query} = this.state;

    return (
      <div className="pt-input-group">
        <span className="pt-icon pt-icon-search" />
        <input
          ref={this.refHandlers.input}
          className="pt-input pt-fill"
          type="text"
          placeholder="Type to filter elements..."
          dir="auto"
          value={query}
          onChange={this.handleQueryInput}
        />
        {query.length > 0 && (
          <button
            className="pt-button pt-minimal pt-icon-cross"
            onClick={this.handleQueryReset}
          />
        )}
      </div>
    );
  }
}

BaseSelect.defaultProps = {
  closeOnSelect: true,
  defaultValue: {},
  disabled: false,
  filterable: true,
  findIndex: (haystack, needle) => haystack.indexOf(needle),
  getItemHeight: undefined,
  inputProps: {
    autoFocus: true
  },
  itemListComposer: undefined,
  itemListPredicate: undefined,
  items: [],
  noResults: <span className="select-noresults">No results</span>,
  onItemSelect: undefined,
  popoverProps: {},
  resetOnSelect: true
};

export default BaseSelect;
