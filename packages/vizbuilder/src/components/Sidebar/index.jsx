import React from "react";
import PropTypes from "prop-types";

import "./BaseSelect.css";
import "./style.css";

import {generateBaseState} from "../../helpers/query";

import ConditionalAnchor from "./ConditionalAnchor";
import FilterManager from "./FilterManager";
import GroupingManager from "./GroupingManager";
import MeasureSelect from "./MeasureSelect";

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.setMeasure = this.setMeasure.bind(this);
  }

  render() {
    const {query, options} = this.props;
    if (!query.cube) return null;

    const measureDetails = query.measure.annotations.details || "";
    const cbMeasures = query.cube.measures.reduce((all, measure) => {
      const msAnnotations = measure.annotations;
      if (
        msAnnotations.error_for_measure === undefined &&
        msAnnotations.error_type === undefined &&
        msAnnotations.source_for_measure === undefined &&
        msAnnotations.collection_for_measure === undefined &&
        msAnnotations.aggregation_method !== "RCA"
      ) {
        all.push(measure);
      }
      return all;
    }, []);

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="control select-measure">
            <p className="label">Showing</p>
            <MeasureSelect
              className="custom-select"
              items={options.measures}
              value={query.measure}
              onItemSelect={this.setMeasure}
            />
            <p className="details">{measureDetails}</p>
          </div>

          <GroupingManager
            className="control select-levels"
            label="Grouped by"
            items={query.groups}
            itemOptions={options.levels}
          />

          <FilterManager
            className="control select-filters"
            label="Filter by"
            items={query.filters}
            itemOptions={cbMeasures}
          />

          {this.renderSourceBlock.call(this)}
        </div>
      </div>
    );
  }

  renderSourceBlock() {
    const ann = this.props.query.cube.annotations;

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
          <ConditionalAnchor className="source-link" href={ann.dataset_link}>
            {ann.dataset_name}
          </ConditionalAnchor>
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
        const isSameCube = newQuery.cube !== query.cube;

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
}

Sidebar.contextTypes = {
  fetchQueries: PropTypes.func,
  generateQueries: PropTypes.func,
  getDefaultGroup: PropTypes.func,
  loadControl: PropTypes.func
};

export default Sidebar;
