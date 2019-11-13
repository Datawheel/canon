import React, {Component} from "react";
import {Button, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import escapeRegExp from "lodash/escapeRegExp";
import {connect} from "react-redux";
import {selectMeasureListForCube} from "../store/query/selectors";

/**
 * @typedef OwnProps
 * @property {boolean} [disabled]
 * @property {MeasureItem | string} [selectedItem]
 * @property {string} labelPlaceholderSelect
 * @property {Partial<import("@blueprintjs/core").IPopoverProps>} [popoverProps]
 * @property {(item: MeasureItem, event?: React.SyntheticEvent<HTMLElement>) => void} onItemSelect
 */

/**
 * @typedef StateProps
 * @property {MeasureItem[]} items
 */

/** @extends {Component<OwnProps&StateProps,{}>} */
class MeasureByCubeSelect extends Component {
  static defaultProps = {
    popoverProps: {
      boundary: "viewport",
      minimal: true,
      targetTagName: "div",
      wrapperTagName: "div"
    }
  };

  /** @type {import("@blueprintjs/select").ItemListPredicate<MeasureItem>} */
  itemListPredicate = (query, items) => {
    query = query.trim();
    query = escapeRegExp(query).replace(/\s+/g, "[^_]+");
    const queryTester = RegExp(query || ".", "i");
    return items.filter(item => queryTester.test(item.searchIndex));
  };

  itemSelectHandler = (item, evt) => {
    const {onItemSelect} = this.props;
    typeof onItemSelect === "function" && onItemSelect(item, evt);
  };

  render() {
    const {disabled, items, labelPlaceholderSelect, popoverProps, selectedItem} = this.props;
    const selectedItemLabel =
      selectedItem == null
        ? labelPlaceholderSelect
        : typeof selectedItem === "object" ? selectedItem.name : selectedItem;

    return (
      <Select
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
          text={selectedItemLabel}
        />
      </Select>
    );
  }

  /** @type {import("@blueprintjs/select").ItemRenderer<MeasureItem>} */
  renderItem = (item, {handleClick, modifiers}) => {
    return (
      <MenuItem
        className="measure-select option"
        disabled={modifiers.disabled}
        key={item.uri}
        onClick={handleClick}
        text={item.caption}
        title={item.name}
      />
    );
  };
}

/** @type {import("react-redux").MapStateToProps<StateProps,OwnProps,GeneralState>} */
function mapState(state) {
  return {
    items: selectMeasureListForCube(state)
  };
}

export default connect(mapState)(MeasureByCubeSelect);
