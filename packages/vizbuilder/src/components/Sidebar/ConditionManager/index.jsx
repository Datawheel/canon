import React from "react";
import PropTypes from "prop-types";
import {Button} from "@blueprintjs/core";
import classNames from "classnames";
import {uuid} from "d3plus-common";

import OPERATORS from "../../../helpers/operators";
import {generateMetaQueries} from "../../../helpers/metaqueries";
import {getValidMeasures} from "../../../helpers/sorting";

import ConditionItem from "./ConditionItem";

import "./style.css";

class ConditionManager extends React.Component {
  constructor(props) {
    super(props);

    this.addCondition = this.addCondition.bind(this);
    this.updateCondition = this.updateCondition.bind(this);
    this.removeCondition = this.removeCondition.bind(this);
  }

  addCondition() {
    const {conditions} = this.props.query;
    const {stateUpdate} = this.context;

    const newConditions = [].concat(conditions, {
      hash: uuid(),
      operator: OPERATORS.EQUAL,
      property: "",
      type: "cut",
      values: []
    });
    return stateUpdate({query: {conditions: newConditions}});
  }

  updateCondition(condition) {
    const {query} = this.props;
    const {loadControl, fetchQuery} = this.context;

    const index = query.conditions.findIndex(cond => cond.hash === condition.hash);

    if (index > -1) {
      loadControl(() => {
        const newConditions = query.conditions.slice();
        newConditions.splice(index, 1, condition);
        return {
          query: {conditions: newConditions},
          metaQueries: generateMetaQueries(query, newConditions)
        };
      }, fetchQuery);
    }
  }

  removeCondition(condition) {
    const {query} = this.props;
    const {loadControl, fetchQuery} = this.context;

    const newConditions = query.conditions.filter(cond => cond.hash !== condition.hash);

    if (newConditions.length < query.conditions.length) {
      loadControl(() => ({
        query: {conditions: newConditions},
        metaQueries: generateMetaQueries(query, newConditions)
      }), fetchQuery);
    }
  }

  render() {
    const props = this.props;
    const {conditions, cube} = props.query;
    const {drilldowns} = props.options;
    const properties = [].concat(getValidMeasures(cube), drilldowns);

    return (
      <div className={classNames(props.className, "condition-manager")}>
        <p className="label">Filters</p>
        <div className="condition-items">
          {conditions.map(function(condition) {
            return React.createElement(ConditionItem, {
              ...condition,
              key: condition.hash,
              properties,
              onUpdate: this.updateCondition,
              onRemove: this.removeCondition
            });
          }, this)}
        </div>
        <Button
          text="Add filter"
          className="pt-fill"
          iconName="insert"
          onClick={this.addCondition}
        />
      </div>
    );
  }
}

ConditionManager.contextTypes = {
  fetchQuery: PropTypes.func,
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

export default ConditionManager;
