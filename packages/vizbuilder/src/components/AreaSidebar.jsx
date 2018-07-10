import React from "react";
import PropTypes from "prop-types";
import queryString from "query-string";

import {setDimension, setDrilldown, setMeasure} from "../actions/events";
import {fetchCubes, fetchQuery} from "../actions/fetch";

import ConditionManager from "./ConditionManager";
import ConditionalAnchor from "./ConditionalAnchor";
import LevelSelect from "./LevelSelect";
import MeasureSelect from "./MeasureSelect";

import "./_AreaSidebar.css";
import BaseSelect from "./BaseSelect";

class AreaSidebar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.fetchQuery = fetchQuery.bind(this);
    this.setDimension = setDimension.bind(this);
    this.setDrilldown = setDrilldown.bind(this);
    this.setMeasure = setMeasure.bind(this);
  }

  componentDidMount() {
    const locationQuery = queryString.parse(location.search);
    this.context.loadControl(
      fetchCubes.bind(this, locationQuery),
      this.fetchQuery
    );
  }

  render() {
    const {query, options} = this.props;

    if (!query.cube) return null;

    const measureDetails = query.measure.annotations.details || "";

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="control">
            <p className="label">Showing</p>
            <MeasureSelect
              className="custom-select"
              items={options.measures}
              value={query.measure}
              onItemSelect={this.setMeasure}
            />
            <p className="details">{measureDetails}</p>
          </div>

          <div className="control">
            <p className="label">Grouped by</p>
            <BaseSelect
              className="custom-select"
              filterable={false}
              items={options.dimensions}
              value={query.dimension}
              onItemSelect={this.setDimension}
            />
          </div>

          <div className="control">
            <p className="label">At depth level</p>
            <LevelSelect
              className="custom-select"
              filterable={false}
              items={options.levels}
              value={query.drilldown}
              onItemSelect={this.setDrilldown}
            />
          </div>

          <ConditionManager query={query} options={options} />
        </div>
        {this.renderSourceBlock.call(this)}
      </div>
    );
  }

  renderSourceBlock() {
    const ann = this.props.query.cube.annotations;

    return (
      <div className="wrapper sources">
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
}

AreaSidebar.contextTypes = {
  loadControl: PropTypes.func
};

export default AreaSidebar;
