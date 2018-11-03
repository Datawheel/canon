import React from "react";
import PropTypes from "prop-types";

import "./style.css";
import "./select.css";

import {generateBaseState} from "../../helpers/query";
import {isValidMeasure} from "../../helpers/validation";

import ConditionalAnchor from "./ConditionalAnchor";
import DatasetSelect from "./DatasetSelect";
import FilterManager from "./FilterManager";
import GroupingManager from "./GroupingManager";
import MeasureSelect from "./MeasureSelect";

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.setMeasure = this.setMeasure.bind(this);
    this.setDataset = this.setDataset.bind(this);
  }

  render() {
    const {query, options} = this.props;
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
              onItemSelect={this.setMeasure}
            />
            <p className="details">{measureDetails}</p>
          </div>

          <GroupingManager
            className="control levels-manager"
            label="Grouped by"
            items={query.groups}
            itemOptions={options.levels}
          />

          <FilterManager
            className="control filters-manager"
            label="Filter by"
            items={query.filters}
            itemOptions={cbMeasures}
          />

          {this.props.children}

          {this.renderSourceBlock.call(this)}
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
    } else {
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

  setMeasure(measure) {
    const {context} = this;
    const {options, query} = this.props;
    const {getDefaultGroup} = context;

    return context.loadControl(
      () => {
        const newState = generateBaseState(options.cubes, measure);
        const newQuery = newState.query;
        const isSameCube = newQuery.cube === query.cube;

        newQuery.activeChart = query.activeChart;
        newQuery.groups = isSameCube
          ? query.groups
          : getDefaultGroup(newState.options.levels);
        newQuery.filters = isSameCube ? query.filters : [];

        return newState;
      },
      context.generateQueries,
      context.fetchQueries
    );
  }

  setDataset(evt) {
    const cubeName = evt.target.value;
    const {options, query} = this.props;
    const tableId = query.measure.annotations._cb_table_id;
    const key = `${tableId}.${query.measure.name}`;
    const measureList = options.measureMap[key];
    const measure = measureList.find(item => item.annotations._cb_name == cubeName);
    return this.setMeasure(measure);
  }
}

Sidebar.contextTypes = {
  fetchQueries: PropTypes.func,
  generateQueries: PropTypes.func,
  getDefaultGroup: PropTypes.func,
  loadControl: PropTypes.func
};

export default Sidebar;
