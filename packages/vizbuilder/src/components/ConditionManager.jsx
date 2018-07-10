import React from "react";
import PropTypes from "prop-types";
import {Button} from "@blueprintjs/core";

import {
  addCondition,
  removeCondition,
  updateCondition
} from "../actions/events";
import {fetchQuery} from "../actions/fetch";

import ConditionItem from "./ConditionItem";

import "./_ConditionManager.css";

class ConditionManager extends React.Component {
  constructor(props) {
    super(props);

    this.fetchQuery = fetchQuery.bind(this);
    this.addCondition = addCondition.bind(this);
    this.updateCondition = updateCondition.bind(this);
    this.removeCondition = removeCondition.bind(this);
  }

  render() {
    const props = this.props;
    const {conditions, cube} = props.query;
    const {drilldowns} = props.options;
    const properties = [].concat(cube.measures, drilldowns);

    return (
      <div className="group condition-manager">
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
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

export default ConditionManager;
