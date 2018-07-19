import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import queryString from "query-string";
import {Position, Toaster} from "@blueprintjs/core";

import {fetchCubes} from "./actions/fetch";
import {loadControl, setStatePromise} from "./actions/loadstate";
import AreaChart from "./components/AreaChart";
import AreaLoading from "./components/AreaLoading";
import AreaSidebar from "./components/AreaSidebar";
import * as api from "./helpers/api";
import initialState from "./state";

import "@blueprintjs/labs/dist/blueprint-labs.css";
import "./index.css";

const UIToaster =
  typeof window !== "undefined"
    ? Toaster.create({className: "area-toaster", position: Position.TOP})
    : null;

class Vizbuilder extends React.PureComponent {
  constructor(props) {
    super(props);

    api.resetClient(props.src);
    this.state = initialState();

    this.loadControl = loadControl.bind(this);
    this.firstLoad = this.firstLoad.bind(this);
    this.stateUpdate = this.stateUpdate.bind(this);
  }

  getChildContext() {
    return {
      loadControl: this.loadControl,
      stateUpdate: this.stateUpdate
    };
  }

  componentDidMount() {
    const locationQuery = queryString.parse(location.search);
    this.firstLoad(locationQuery);
  }

  componentDidUpdate(prevProps, prevState) {
    const {src, datasetDidChange} = this.props;
    const {dataset, load} = this.state;
    const {error, severity} = load;

    if (src && prevProps.src !== src) {
      api.resetClient(src);
      this.setState(initialState(), this.firstLoad);
    }

    if (datasetDidChange && dataset !== prevState.dataset) {
      datasetDidChange(dataset);
    }

    if (error && prevState.load.error !== error) {
      console.warn(error.stack);
      UIToaster.show({intent: severity, message: error.message});
    }
  }

  render() {
    const {dataset, load, members, options, query, queryOptions} = this.state;
    return (
      <div className={classnames("vizbuilder", {loading: load.inProgress})}>
        <AreaLoading {...load} />
        <AreaSidebar options={options} query={query} queryOptions={queryOptions} />
        <AreaChart dataset={dataset} members={members} query={query} />
      </div>
    );
  }

  stateUpdate(newState) {
    return setStatePromise.call(this, state => {
      const finalState = {};
      const keys = Object.keys(newState);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        finalState[key] = {
          ...state[key],
          ...newState[key]
        };
      }

      return finalState;
    });
  }

  firstLoad(locationQuery) {
    this.loadControl(fetchCubes.bind(this, locationQuery), () => {
      const {query, queryOptions} = this.state;
      return api.query({
        ...query,
        options: queryOptions
      });
    });
  }
}

Vizbuilder.childContextTypes = {
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

Vizbuilder.propTypes = {
  src: PropTypes.string,
  datasetWillChange: PropTypes.func,
  datasetDidChange: PropTypes.func
};

export default Vizbuilder;
