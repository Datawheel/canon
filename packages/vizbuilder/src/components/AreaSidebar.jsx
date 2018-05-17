import React from "react";

import BaseSelect from "./BaseSelect";
// import FilterManager from './FilterManager'
import connect from "../store/connect";
import { fetchCubes, setCube, setMeasure, setLevel, removeLevel } from "../actions";

class AreaSidebar extends React.PureComponent {
  componentDidMount() {
    fetchCubes();
  }

  render() {
    const options = this.props.options;
    const query = this.props.query;

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="group">
            <h3>Cube</h3>
            <BaseSelect items={options.cubes} value={query.cube} onItemSelect={setCube} />
          </div>
          <div className="group">
            <h3>Level</h3>
            <BaseSelect multiple={true} items={options.levels} value={query.drilldowns} onItemSelect={setLevel} onItemRemove={removeLevel} />
          </div>
          <div className="group">
            <h3>Measure</h3>
            <BaseSelect items={options.measures} value={query.measure} onItemSelect={setMeasure} />
          </div>
          {/* <FilterManager /> */}
        </div>
      </div>
    );
  }
}

export default connect(AreaSidebar);
