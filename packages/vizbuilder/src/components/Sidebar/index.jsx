import React from "react";
import PropTypes from "prop-types";
import {Checkbox} from "@blueprintjs/core";

import "./style.css";
import "./select.css";

import {
  generateBaseState,
  replaceLevelsInGroupings,
  replaceMeasureInFilters,
  replaceKeysInString
} from "../../helpers/query";
import {isValidMeasure} from "../../helpers/validation";
import {getGeoLevel, userTableIdMeasure} from "../../helpers/sorting";

import ConditionalAnchor from "./ConditionalAnchor";
import DatasetSelect from "./DatasetSelect";
import FilterManager from "./FilterManager";
import GroupingManager from "./GroupingManager";
import MeasureSelect from "./NewMeasureSelect";

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.setMeasure = this.setMeasure.bind(this);
    this.setDataset = this.setDataset.bind(this);
    this.toggleConfidenceInt = this.toggleConfidenceInt.bind(this);
  }

  render() {
    const {query, options, uiParams} = this.props;
    if (!query.cube) return null;

    const measureDetails = query.measure.annotations.details || "";
    const cbMeasures = query.cube.measures.filter(isValidMeasure);

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="control measure-manager">
            <p className="label">Showing</p>
            <MeasureSelect
              className="select-measure"
              items={options.measures}
              itemMap={options.measureMap}
              value={query.measure}
              showDimensions={!options.geomapLevels}
              onItemSelect={this.setMeasure}
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
      datasetValue = 
        <DatasetSelect
          items={options.measureMap[key]}
          onChange={this.setDataset}
          value={query.measure}
        />
      ;
    }
    else {
      datasetValue = 
        <ConditionalAnchor className="source-link" href={ann.dataset_link}>
          {ann.dataset_name}
        </ConditionalAnchor>
      ;
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

  setMeasure(measure, useTableDefaults = true) {
    const {getDefaultGroup, getDefaultTable} = this.context;
    const {options, query, uiParams} = this.props;

    const areMeasuresFromSameTable = (oldQ, newQ) => {
      const {table_id} = newQ.cube.annotations;
      if (!table_id) {
        return false;
      }
      const key = `${table_id}.${newQ.measure.name}`;
      const measures = options.measureMap[key];
      return measures.indexOf(oldQ.measure) > -1 && measures.indexOf(newQ.measure) > -1;
    };

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
      }
      else if (areMeasuresFromSameTable(query, newQuery)) {
        newQuery.filters = replaceMeasureInFilters(query.filters, newQuery.cube);
        return replaceLevelsInGroupings(query, newQuery).then(newGroups => {
          newQuery.groups = newGroups;
          newQuery.geoLevel = getGeoLevel(newQuery);
          newUiParams.activeChart = replaceKeysInString(
            uiParams.activeChart,
            query.groups,
            newQuery.groups
          );
          return newState;
        });
      }
      else {
        newQuery.groups = getDefaultGroup(
          newState.options.levels,
          measure.annotations.ui_default_drilldown
        );
        newQuery.filters = [];
        newUiParams.activeChart = null;
      }

      newQuery.geoLevel = getGeoLevel(newQuery);
      return newState;
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
