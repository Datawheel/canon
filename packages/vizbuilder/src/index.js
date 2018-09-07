import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import queryString from "query-string";
import {Position, Toaster} from "@blueprintjs/core";

import {fetchCubes} from "./actions/fetch";
import {loadControl, setStatePromise} from "./actions/loadstate";
import ChartArea from "./components/ChartArea";
import Sidebar from "./components/Sidebar";
import * as api from "./helpers/api";
import initialState from "./state";

import LoadingScreen from "components/Loading";

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
    this.defaultQuery = {};

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
    const defaultQuery = {
      ...queryString.parse(window.location.search),
      ...this.getDefaultQuery(this.props)
    }
    this.defaultQuery = defaultQuery;
    this.firstLoad(defaultQuery);
  }

  componentDidUpdate(prevProps, prevState) {
    const {src} = this.props;
    const {load} = this.state;
    const {error, severity} = load;

    if (src && prevProps.src !== src) {
      api.resetClient(src);
      this.setState(initialState(), this.firstLoad);
    }

    if (error && prevState.load.error !== error) {
      console.warn(error.stack);
      UIToaster.show({intent: severity, message: error.message});
    }
  }

  render() {
    const {config, formatting, topojson, visualizations} = this.props;
    const {dataset, load, members, options, query, queryOptions} = this.state;
    return (
      <div className={classnames("vizbuilder", {loading: load.inProgress})}>
        <LoadingScreen total={load.total} progress={load.done} />
        <Sidebar
          defaultQuery={this.defaultQuery}
          options={options}
          query={query}
          queryOptions={queryOptions}
        />
        <ChartArea
          dataset={dataset}
          formatting={formatting}
          members={members}
          query={query}
          topojson={topojson}
          userConfig={config}
          visualizations={visualizations}
        />
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

  firstLoad(initialQuery) {
    this.loadControl(fetchCubes.bind(this, initialQuery), () => {
      const {query, queryOptions} = this.state;
      return api.query({
        ...query,
        options: queryOptions
      });
    });
  }

  getDefaultQuery(props) {
    const defaultQuery = {};
    if (props.defaultMeasure) {
      defaultQuery.defaultMeasure = props.defaultMeasure;
    }
    if (props.defaultDimension) {
      defaultQuery.defaultDimension = props.defaultDimension;
    }
    if (props.defaultLevel) {
      defaultQuery.defaultLevel = props.defaultLevel;
    }
    return defaultQuery;
  }
}

Vizbuilder.childContextTypes = {
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

Vizbuilder.propTypes = {
  // this config object will be applied to all charts
  config: PropTypes.object,
  // default dimension and level are optional
  // but if set, default measure is required
  defaultDimension: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  defaultLevel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  defaultMeasure: PropTypes.string,
  // formatting functions object,
  // keys are the possible values of measure.annotations.units_of_measurement
  // values are the formatting function to apply to those measures
  formatting: PropTypes.objectOf(PropTypes.func),
  // source URL for the mondrian server
  src: PropTypes.string.isRequired,
  topojson: PropTypes.objectOf(
    // keys are the Level names where each object apply
    PropTypes.shape({
      // URL for the topojson file
      topojson: PropTypes.string.isRequired,
      // the key that relates each topojson shape with the dataset value
      topojsonId: PropTypes.string,
      // the key in the topojson file for the shapes to use
      topojsonKey: PropTypes.string
    })
  ),
  visualizations: PropTypes.arrayOf(PropTypes.string)
};

Vizbuilder.defaultProps = {
  config: {},
  formatting: {},
  topojson: {},
  visualizations: [
    "geomap",
    "treemap",
    "barchart",
    "lineplot",
    "histogram",
    "barchartyear",
    "stacked"
  ]
};

export default Vizbuilder;
