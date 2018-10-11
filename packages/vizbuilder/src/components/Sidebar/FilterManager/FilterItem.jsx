import {Button, NumericInput} from "@blueprintjs/core";
import PropTypes from "prop-types";
import React from "react";

import {composePropertyName} from "../../../helpers/formatting";
import OPERATORS, {KIND_NUMBER as NUMBER_OPERATORS, LABELS as OPERATOR_LABELS} from "../../../helpers/operators";

import ConditionPropertySelect from "../ConditionPropertySelect";
import SidebarCRUDItem from "../SidebarCRUDItem";
import Filter from "./Filter";

/**
 * @augments React.Component<IProps,IState>
 */
class FilterItem extends SidebarCRUDItem {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.item.new,
      newItem: null
    };

    this.handleSetMeasure = this.handleUpdate.bind(this, "setMeasure");
    this.handleSetOperator = this.handleUpdate.bind(this, "setOperator");
    this.handleSetValue = this.handleUpdate.bind(this, "setValue");
  }

  render() {
    return this.state.isOpen
      ? this.renderEditable.call(this)
      : this.renderClosed.call(this);
  }

  renderClosed() {
    const {item} = this.props;
    return (
      <div className="filter-item">
        <div className="group values">
          <div className="filter-name">{composePropertyName(item.measure)}</div>
          <div className="filter-operator">{item.operatorLabel}</div>
          <div className="filter-value">{item.value}</div>
        </div>
        <div className="group actions">
          <Button
            text="Delete"
            className="pt-small"
            onClick={this.handleDelete}
          />
          <Button
            text={"Edit params"}
            className="pt-small pt-intent-primary"
            onClick={this.handleEdit}
          />
        </div>
      </div>
    );
  }

  renderEditable() {
    const {item, options} = this.props;
    const activeItem = this.state.newItem || item;
    return (
      <div className="filter-item editing">
        <div className="group filter-measure">
          <ConditionPropertySelect
            className="custom-select"
            value={activeItem.measure}
            items={options}
            onItemSelect={this.handleSetMeasure}
          />
        </div>
        <div className="group filter-values pt-control-group">
          <div className="pt-select pt-fill">
            <select value={activeItem.operator} onChange={this.handleSetOperator}>
              {NUMBER_OPERATORS.map(ms => (
                <option key={ms} value={OPERATORS[ms]}>
                  {OPERATOR_LABELS[ms]}
                </option>
              ))}
            </select>
          </div>
          <NumericInput
            className="pt-fill"
            value={activeItem.value}
            onValueChange={this.handleSetValue}
          />
        </div>
        <div className="group actions">
          <Button
            className="pt-small"
            onClick={activeItem.measure ? this.handleClose : this.handleDelete}
            text={activeItem.measure ? "Cancel" : "Delete"}
          />
          <Button
            className="pt-small pt-intent-primary"
            disabled={!Filter.isValid(activeItem)}
            onClick={this.handleApply}
            text="Apply changes"
          />
        </div>
      </div>
    );
  }
}

FilterItem.propTypes = {
  item: PropTypes.instanceOf(Filter),
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  options: PropTypes.array
};

/**
 * @typedef IProps
 * @prop {Filter} item
 * @prop {(filter: Filter) => void} onDelete
 * @prop {(filter: Filter) => void} onUpdate
 * @prop {Measure[]} options
 */

/**
 * @typedef IState
 * @prop {boolean} isOpen
 * @prop {Filter} newItem
 */

export default FilterItem;
