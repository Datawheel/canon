import {Button, ControlGroup, HTMLSelect, Intent, NumericInput} from "@blueprintjs/core";
import React, {Component} from "react";
import {firstTruthy} from "../helpers/booleans";
import OPERATORS, {
  KIND_NUMBER as NUMBER_OPERATORS,
  LABELS as OPERATOR_LABELS
} from "../helpers/operators";
import {structFilter} from "../helpers/structs";
import {isValidFilter} from "../helpers/validation";
import CubeMeasureSelect from "./SelectorMeasureByCube";

/**
 * @typedef OwnProps
 * @property {(d: number) => string} formatter
 * @property {string} identifier
 * @property {string} labelActionApply
 * @property {string} labelActionDelete
 * @property {string} labelActionEdit
 * @property {string} labelActionReset
 * @property {number} multiplier
 * @property {(filterItem: FilterItem) => void} onUpdate
 * @property {(filterItem: Pick<FilterItem, "key">) => void} onDelete
 */

/**
 * @typedef OwnState
 * @property {boolean} isOpen
 * @property {string} [nextMeasure]
 * @property {string} [nextOperator]
 * @property {string} [nextInputtedValue]
 */

/** @extends Component<FilterItem&OwnProps,OwnState> */
class FilterItemControl extends Component {
  static defaultProps = {
    formatter: d => d,
    multiplier: 1
  };

  /** @type {OwnState} */
  state = {
    isOpen: true
  };

  deleteHandler = () => {
    const {onDelete, identifier} = this.props;
    typeof onDelete === "function" && onDelete({key: identifier});
  };

  editHandler = () => this.setState({isOpen: true});

  resetHandler = () =>
    this.setState({
      isOpen: false,
      nextInputtedValue: undefined,
      nextMeasure: undefined,
      nextOperator: undefined
    });

  updateHandler = () => {
    const {props, state} = this;
    const inputtedValue = firstTruthy(state.nextInputtedValue, props.inputtedValue);
    const interpretedValue = Number.parseFloat(`${inputtedValue}`) / props.multiplier;

    !isNaN(interpretedValue) &&
      typeof props.onUpdate === "function" &&
      props.onUpdate(
        structFilter({
          inputtedValue,
          interpretedValue,
          key: props.identifier,
          measure: firstTruthy(state.nextMeasure, props.measure),
          operator: firstTruthy(state.nextOperator, props.operator)
        })
      );

    this.setState({isOpen: false});
  };

  setMeasureHandler = ({name: nextMeasure}) => this.setState({nextMeasure});

  setOperatorHandler = event => this.setState({nextOperator: event.target.value});

  setValueHandler = (nextInterpretedValue, nextInputtedValue) =>
    this.setState({nextInputtedValue});

  render() {
    const {measure} = this.props;
    return !measure || this.state.isOpen
      ? this.renderEditable.call(this)
      : this.renderClosed.call(this);
  }

  renderClosed() {
    const {
      formatter,
      interpretedValue,
      labelActionDelete,
      labelActionEdit,
      measure,
      operator
    } = this.props;

    return (
      <fieldset className="filter-item">
        <div className="values">
          <span className="filter-name">{measure}</span>
          <span> </span>
          <span className="filter-operator">{operator}</span>
          <span> </span>
          <span className="filter-value">{formatter(interpretedValue)}</span>
        </div>
        <div className="actions">
          <Button
            className="action-delete"
            onClick={this.deleteHandler}
            small
            text={labelActionDelete}
          />
          <Button
            className="action-edit"
            intent={Intent.PRIMARY}
            onClick={this.editHandler}
            small
            text={labelActionEdit}
          />
        </div>
      </fieldset>
    );
  }

  renderEditable() {
    const {
      operator: prevOperator,
      inputtedValue: prevInputtedValue,
      labelActionApply,
      labelActionDelete,
      labelActionReset,
      multiplier,
      measure: prevMeasure
    } = this.props;
    const {nextMeasure, nextInputtedValue, nextOperator} = this.state;

    const measure = firstTruthy(nextMeasure, prevMeasure);
    const operator = firstTruthy(nextOperator, prevOperator);
    const inputtedValue = firstTruthy(nextInputtedValue, prevInputtedValue, "0");
    const interpretedValue = Number.parseFloat(`${inputtedValue}`) / multiplier;

    return (
      <fieldset className="filter-item edit">
        <div className="group filter-measure">
          <CubeMeasureSelect
            labelPlaceholderSelect="Select..."
            onItemSelect={this.setMeasureHandler}
            selectedItem={measure}
          />
        </div>
        <ControlGroup fill className="group filter-values">
          <HTMLSelect
            fill
            onChange={this.setOperatorHandler}
            options={NUMBER_OPERATORS.map(ms => ({
              label: OPERATOR_LABELS[ms],
              value: OPERATORS[ms]
            }))}
            value={operator}
          />
          <NumericInput fill onValueChange={this.setValueHandler} value={inputtedValue} />
        </ControlGroup>
        <div className="group actions">
          <Button
            className={measure ? "action-reset" : "action-delete"}
            onClick={measure ? this.resetHandler : this.deleteHandler}
            small
            text={measure ? labelActionReset : labelActionDelete}
          />
          <Button
            className="action-apply"
            disabled={!isValidFilter({operator, interpretedValue, measure})}
            intent={Intent.PRIMARY}
            onClick={this.updateHandler}
            small
            text={labelActionApply}
          />
        </div>
      </fieldset>
    );
  }
}

export default FilterItemControl;
