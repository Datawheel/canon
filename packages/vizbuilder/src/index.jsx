import React from "react";
import PropTypes from "prop-types";

import AreaLoading from "./components/AreaLoading";
import AreaSidebar from "./components/AreaSidebar";
import AreaChart from "./components/AreaChart";
import {initClient} from "./helpers/api";
import initialState from "./state";
import {
  loadCycle,
  queryUpdate,
  optionsUpdate,
  datasetUpdate
} from "./actions/mutations";

import "@blueprintjs/core/dist/blueprint.css";
import "@blueprintjs/labs/dist/blueprint-labs.css";
import "./index.css";

class Vizbuilder extends React.PureComponent {
  constructor(props) {
    super(props);

    initClient(props.src);
    this.state = initialState;

    this.loadCycle = loadCycle.bind(this);
    this.queryUpdate = queryUpdate.bind(this);
    this.optionsUpdate = optionsUpdate.bind(this);
    this.datasetUpdate = datasetUpdate.bind(this);
  }

  getChildContext() {
    return {
      ...this.state,
      loadCycle: this.loadCycle,
      queryUpdate: this.queryUpdate,
      optionsUpdate: this.optionsUpdate,
      datasetUpdate: this.datasetUpdate
    };
  }

  render() {
    return (
      <div className="vizbuilder">
        <AreaLoading />
        <AreaSidebar />
        <AreaChart />
      </div>
    );
  }
}

Vizbuilder.childContextTypes = {
  loading: PropTypes.bool,
  loadTotal: PropTypes.number,
  loadDone: PropTypes.number,
  loadError: PropTypes.any,
  query: PropTypes.any,
  options: PropTypes.any,
  dataset: PropTypes.array,
  loadCycle: PropTypes.func,
  queryUpdate: PropTypes.func,
  optionsUpdate: PropTypes.func,
  datasetUpdate: PropTypes.func
};

export default Vizbuilder;
