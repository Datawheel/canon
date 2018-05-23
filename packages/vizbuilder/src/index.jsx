import React from "react";
import PropTypes from "prop-types";

import AreaLoading from "./components/AreaLoading";
import AreaSidebar from "./components/AreaSidebar";
import AreaChart from "./components/AreaChart";
import {initClient} from "./helpers/api";
import initialState, {loadTypes, queryTypes, optionsTypes} from "./state";
import {
  loadWrapper,
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
    this.state = initialState();

    this.loadWrapper = loadWrapper.bind(this);
    this.queryUpdate = queryUpdate.bind(this);
    this.optionsUpdate = optionsUpdate.bind(this);
    this.datasetUpdate = datasetUpdate.bind(this);
  }

  getChildContext() {
    return {
      ...this.state,
      loadWrapper: this.loadWrapper,
      queryUpdate: this.queryUpdate,
      optionsUpdate: this.optionsUpdate,
      datasetUpdate: this.datasetUpdate
    };
  }

  render() {
    const {options, query, dataset} = this.state;
    return (
      <div className="vizbuilder">
        <AreaLoading {...this.state.load} />
        <AreaSidebar options={options} query={query} />
        <AreaChart dataset={dataset} query={query} />
      </div>
    );
  }
}

Vizbuilder.childContextTypes = {
  dataset: PropTypes.array,
  load: loadTypes,
  options: optionsTypes,
  query: queryTypes,
  datasetUpdate: PropTypes.func,
  loadWrapper: PropTypes.func,
  optionsUpdate: PropTypes.func,
  queryUpdate: PropTypes.func
};

export default Vizbuilder;
