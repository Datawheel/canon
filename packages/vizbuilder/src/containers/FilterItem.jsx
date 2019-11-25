import {ControlGroup, HTMLSelect, NumericInput} from "@blueprintjs/core";
import React, {Component} from "react";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import MiniButton from "../components/MiniButton";
import SimpleSelect from "../components/SimpleSelect";
import {Comparison} from "../helpers/enums";
import {fuzzySearch} from "../helpers/find";
import {structFilter} from "../helpers/structs";
import {isValidFilter} from "../helpers/validation";
import {doRunQueryCore} from "../middleware/actions";
import {doFilterDelete, doFilterUpdate} from "../store/query/actions";
import {selectFilterMap, selectMeasureListForCube} from "../store/query/selectors";

/**
 * @typedef OwnProps
 * @property {string} identifier
 * @property {Record<string, number>} multipliers
 * @property {Record<string, (d: number) => string>} formatters
 */

/**
 * @typedef OwnState
 * @property {boolean} isOpen
 * @property {string} [nextMeasure]
 * @property {string} [nextOperator]
 * @property {string} [nextInputtedValue]
 */

/**
 * @typedef StateProps
 * @property {MeasureItem[]} measures
 * @property {FilterItem} filter
 */

/**
 * @typedef DispatchProps
 * @property {(filterItem: FilterItem) => void} onDelete
 * @property {(filterItem: FilterItem) => void} onUpdate
 */

/** @extends {Component<import("react-i18next").WithNamespaces & OwnProps & StateProps & DispatchProps, OwnState>} */
class FilterItemControl extends Component {
  /** @type {OwnState} */
  state = {
    isOpen: true,
    nextInputtedValue: this.props.filter.inputtedValue,
    nextMeasure: this.props.filter.measure,
    nextOperator: this.props.filter.operator
  };

  deleteHandler = () => {
    const props = this.props;
    props.onDelete(props.filter);
  };

  editHandler = () => {
    const {filter} = this.props;
    this.setState({
      isOpen: true,
      nextInputtedValue: filter.inputtedValue,
      nextMeasure: filter.measure,
      nextOperator: filter.operator
    });
  };

  resetHandler = () =>
    this.setState({
      isOpen: false,
      nextInputtedValue: undefined,
      nextMeasure: undefined,
      nextOperator: undefined
    });

  updateHandler = () => {
    const props = this.props;
    const {nextInputtedValue: inputtedValue, nextMeasure, nextOperator} = this.state;
    const multiplier = props.multipliers[nextMeasure] || 1;
    const interpretedValue = Number.parseFloat(`${inputtedValue}`) / multiplier;
    !isNaN(interpretedValue) &&
      props.onUpdate(
        structFilter({
          inputtedValue,
          interpretedValue,
          key: props.identifier,
          measure: nextMeasure,
          operator: nextOperator
        })
      );
    this.resetHandler();
  };

  setMeasureHandler = ({name: nextMeasure}) => this.setState({nextMeasure});

  setOperatorHandler = event => this.setState({nextOperator: event.target.value});

  setValueHandler = (_, nextInputtedValue) => this.setState({nextInputtedValue});

  render() {
    return this.state.isOpen
      ? this.renderEditable.call(this)
      : this.renderClosed.call(this);
  }

  renderClosed() {
    const {props, state} = this;
    const {t} = props;
    const {interpretedValue, measure, operator} = props.filter;
    const formatter = props.formatters[measure] || (d => `${d}`);

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
          <MiniButton className="action-delete" onClick={this.deleteHandler}>
            {t("Vizbuilder.action_delete")}
          </MiniButton>
          <MiniButton className="action-edit" onClick={this.editHandler} primary>
            {t("Vizbuilder.action_edit")}
          </MiniButton>
        </div>
      </fieldset>
    );
  }

  renderEditable() {
    const {props, state} = this;
    const {t} = props;
    const {
      nextInputtedValue: inputtedValue,
      nextMeasure: measure,
      nextOperator: operator
    } = state;
    const multiplier = props.multipliers[measure] || 1;
    const interpretedValue = Number.parseFloat(`${inputtedValue}`) / multiplier;

    const selectedMeasure = measure
      ? props.measures.find(m => m.name === measure)
      : undefined;

    const MeasureSelect = SimpleSelect;

    const varButtonText = measure
      ? t("Vizbuilder.action_reset")
      : t("Vizbuilder.action_delete");

    return (
      <fieldset className="filter-item edit">
        <div className="group filter-measure">
          <MeasureSelect
            className="select-measure"
            onItemSelect={this.setMeasureHandler}
            itemListPredicate={(query, items) => fuzzySearch(items, query, "searchIndex")}
            options={props.measures}
            placeholder="Select..."
            selectedItem={selectedMeasure}
          />
        </div>

        <ControlGroup fill className="group filter-values">
          <HTMLSelect fill onChange={this.setOperatorHandler} value={operator}>
            <option value={Comparison.EQ}>{t("Vizbuilder.comparison.EQ")}</option>
            <option value={Comparison.LT}>{t("Vizbuilder.comparison.LT")}</option>
            <option value={Comparison.LTE}>{t("Vizbuilder.comparison.LTE")}</option>
            <option value={Comparison.GT}>{t("Vizbuilder.comparison.HT")}</option>
            <option value={Comparison.GTE}>{t("Vizbuilder.comparison.HTE")}</option>
          </HTMLSelect>
          <NumericInput fill onValueChange={this.setValueHandler} value={inputtedValue} />
        </ControlGroup>

        <div className="group actions">
          <MiniButton
            className={measure ? "action-reset" : "action-delete"}
            onClick={measure ? this.resetHandler : this.deleteHandler}
            text={varButtonText}
          />
          <MiniButton
            className="action-apply"
            disabled={!isValidFilter({operator, interpretedValue, measure})}
            onClick={this.updateHandler}
            primary
            text={t("Vizbuilder.action_apply")}
          />
        </div>
      </fieldset>
    );
  }
}

/** @type {import("react-redux").MapStateToProps<StateProps, OwnProps, GeneralState>} */
function mapState(state, props) {
  return {
    filter: selectFilterMap(state)[props.identifier],
    measures: selectMeasureListForCube(state)
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps, OwnProps>} */
function mapDispatch(dispatch) {
  return {
    onDelete(groupItem) {
      dispatch(doFilterDelete(groupItem));
      dispatch(doRunQueryCore());
    },

    onUpdate(groupItem) {
      dispatch(doFilterUpdate(groupItem));
      dispatch(doRunQueryCore());
    }
  };
}

export default withNamespaces()(connect(mapState, mapDispatch)(FilterItemControl));
