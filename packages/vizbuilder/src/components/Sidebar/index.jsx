import {Button, Checkbox} from "@blueprintjs/core";
import classnames from "classnames";
import PropTypes from "prop-types";
import React, {PureComponent} from "react";

import "./style.css";

import {
  generateBaseState,
  replaceKeysInString,
  replaceLevelsInGroupings,
  replaceMeasureInFilters
} from "../../helpers/query";
import {getGeoLevel, userTableIdMeasure} from "../../helpers/sorting";
import {isValidMeasure} from "../../helpers/validation";

import MeasureSelect from "./AllMeasureSelect";
import ConditionalAnchor from "./ConditionalAnchor";
import DatasetSelect from "./DatasetSelect";
import FilterManager from "./FilterManager";
import GroupingManager from "./GroupingManager";

class Sidebar extends PureComponent {
  constructor(props) {
    super(props);
    this.resetDefaults = this.resetDefaults.bind(this);
    this.setDataset = this.setDataset.bind(this);
    this.setMeasure = this.setMeasure.bind(this);
    this.toggleConfidenceInt = this.toggleConfidenceInt.bind(this);
  }

  render() {
    const {query, options, uiParams, isDefaultQuery} = this.props;
    if (!query.cube) return null;

    const measureDetails = query.measure.annotations.details || "";
    const cbMeasures = query.cube.measures.filter(isValidMeasure);

    return (
      <div className={classnames("area-sidebar", {hidden: this.props.hidden})}>
        <div className="wrapper">
          <div className="control measure-manager">
            <p className="label">Showing</p>
            <MeasureSelect
              className="select-measure"
              itemMap={options.measureMap}
              items={options.measures}
              onItemSelect={this.setMeasure}
              selectedItem={query.measure}
            />
            <p className="details">{measureDetails}</p>
            <p className="show-ci" hidden={!query.moe && !(query.lci || query.uci)}>
              <Checkbox
                checked={uiParams.showConfidenceInt}
                label="Calculate Margins of Error"
                onChange={this.toggleConfidenceInt}
              />
            </p>
          </div>

          <GroupingManager
            className="control levels-manager"
            forcedLimit={this.props.groupLimit}
            itemOptions={options.levels}
            items={query.groups}
            label="Grouped by"
            query={query}
          />

          <FilterManager
            className="control filters-manager"
            itemOptions={cbMeasures}
            items={query.filters}
            label="Filter by"
          />

          {this.renderSourceBlock.call(this)}

          <div className="control reset-defaults">
            <Button
              className="bp3-fill action-reset"
              text="Reset to Defaults"
              icon="undo"
              disabled={isDefaultQuery}
              onClick={this.resetDefaults}
            />
          </div>

          {this.props.children}
        </div>
      </div>
    );
  }

  renderSourceBlock() {
    const {query, options} = this.props;
    const ann = query.cube.annotations;
    const key = `${ann.table_id}.${query.measure.name}`;

    let datasetValue;
    if (key in options.measureMap) {
      datasetValue = (
        <DatasetSelect
          items={options.measureMap[key]}
          onChange={this.setDataset}
          value={query.measure}
        />
      );
    }
    else {
      datasetValue = (
        <ConditionalAnchor className="source-link" href={ann.dataset_link}>
          {ann.dataset_name}
        </ConditionalAnchor>
      );
    }

    return (
      <div className="control sources">
        <p hidden={!ann.source_name}>
          <span>Source: </span>
          <ConditionalAnchor className="source-link" href={ann.source_link}>
            {ann.source_name}
          </ConditionalAnchor>
        </p>
        <p hidden={!ann.source_description}>{ann.source_description}</p>
        <p hidden={!ann.dataset_name}>
          <span>Dataset: </span>
          {datasetValue}
        </p>
      </div>
    );
  }

  resetDefaults() {
    const {getDefaultGroup} = this.context;
    const {options} = this.props;
    const {measure} = this.props.query;

    return this.context.loadControl(() => {
      const newState = generateBaseState(options.cubes, measure, options.geomapLevels);
      const newQuery = newState.query;

      newQuery.groups = getDefaultGroup(
        newState.options.levels,
        measure.annotations.ui_default_drilldown
      );
      newQuery.filters = [];
      newQuery.geoLevel = getGeoLevel(newQuery);
      newState.uiParams.activeChart = null;

      return newState;
    });
  }

  setMeasure(measure, useTableDefaults = true) {
    const {getDefaultGroup, getDefaultTable} = this.context;
    const {options, query, uiParams} = this.props;

    return this.context.loadControl(() => {
      if (getDefaultTable && useTableDefaults) {
        measure = userTableIdMeasure(
          measure,
          options.measureMap,
          options.cubes,
          getDefaultTable
        );
      }

      const newState = generateBaseState(options.cubes, measure, options.geomapLevels);
      const newUiParams = newState.uiParams;
      const newQuery = newState.query;

      if (newQuery.cube === query.cube) {
        newQuery.groups = query.groups;
        newQuery.filters = query.filters;
        newUiParams.activeChart = uiParams.activeChart;
        newQuery.geoLevel = getGeoLevel(newQuery);
        return newState;
      }
      else {
        return replaceLevelsInGroupings(query, newQuery).then(newGroups => {
          if (newGroups.length === 0) {
            newQuery.groups = getDefaultGroup(
              newState.options.levels,
              measure.annotations.ui_default_drilldown
            );
            newQuery.filters = [];
            newUiParams.activeChart = null;
          }
          else {
            newQuery.groups = newGroups;
            newQuery.filters = replaceMeasureInFilters(query.filters, newQuery.cube);
            newUiParams.activeChart = replaceKeysInString(
              uiParams.activeChart,
              query.groups,
              newQuery.groups
            );
          }

          newQuery.geoLevel = getGeoLevel(newQuery);
          return newState;
        });
      }
    });
  }

  setDataset(evt) {
    const cubeName = evt.target.value;
    const {options, query} = this.props;
    const tableId = query.measure.annotations._cb_table_id;
    const key = `${tableId}.${query.measure.name}`;
    const measureList = options.measureMap[key];
    const measure = measureList.find(item => item.annotations._cb_name == cubeName);
    return this.setMeasure(measure, false);
  }

  toggleConfidenceInt(evt) {
    const uiParams = {showConfidenceInt: evt.target.checked};
    this.context.loadControl(() => ({uiParams}));
  }
}

Sidebar.contextTypes = {
  getDefaultGroup: PropTypes.func,
  getDefaultTable: PropTypes.func,
  loadControl: PropTypes.func
};

export default Sidebar;
