import React from "react";
import PropTypes from "prop-types";

import BaseSelect from "./BaseSelect";
import {setCube, setMeasure, setLevel, removeLevel} from "../actions/events";
import {fetchCubes} from "../actions/fetch";

import "./AreaSidebar.css";

class AreaSidebar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setCube = setCube.bind(this);
    this.setMeasure = setMeasure.bind(this);
    this.setLevel = setLevel.bind(this);
    this.removeLevel = removeLevel.bind(this);
  }

  componentDidMount() {
    this.context.datasetUpdate([
      {parent: "Group 1", id: "alpha", value: 29},
      {parent: "Group 1", id: "beta", value: 10},
      {parent: "Group 1", id: "gamma", value: 2},
      {parent: "Group 2", id: "delta", value: 29},
      {parent: "Group 2", id: "eta", value: 25}
    ]);
    fetchCubes.call(this);
  }

  render() {
    const {query, options} = this.context;

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="group">
            <h3>Cube</h3>
            <BaseSelect
              items={options.cubes}
              value={query.cube}
              onItemSelect={this.setCube}
            />
          </div>
          <div className="group">
            <h3>Level</h3>
            <BaseSelect
              multiple={true}
              items={options.levels}
              value={query.drillDowns}
              onItemSelect={this.setLevel}
              onItemRemove={this.removeLevel}
            />
          </div>
          <div className="group">
            <h3>Measure</h3>
            <BaseSelect
              items={options.measures}
              value={query.measure}
              onItemSelect={this.setMeasure}
            />
          </div>
        </div>
      </div>
    );
  }
}

AreaSidebar.contextTypes = {
  query: PropTypes.any,
  options: PropTypes.any,
  queryUpdate: PropTypes.func,
  optionsUpdate: PropTypes.func,
  datasetUpdate: PropTypes.func,
  loadCycle: PropTypes.func,
};

export default AreaSidebar;
