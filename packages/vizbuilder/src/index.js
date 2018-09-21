import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import {Position, Toaster} from "@blueprintjs/core";

import {fetchCubes, fetchQuery} from "./actions/fetch";
import {loadControl, setStatePromise, mergeStates} from "./actions/loadstate";
import ChartArea from "./components/ChartArea";
import Sidebar from "./components/Sidebar";
import PermalinkManager from "./components/PermalinkManager";
import * as api from "./helpers/api";
import {parsePermalink, permalinkToState} from "./helpers/permalink";
import {isSameQuery} from "./helpers/validation";
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
    this.queryHistory = [];

    this.defaultQuery = {
      defaultMeasure: props.defaultMeasure,
      defaultDimension: props.defaultDimension,
      defaultLevel: props.defaultLevel
    };

    this.permalinkKeywords = {
      dimension: "dimension",
      enlarged: "enlarged",
      filters: "filters",
      level: "level",
      measure: "measure",
      ...props.permalinkKeywords
    };

    this.loadControl = loadControl.bind(this);
    this.fetchQuery = fetchQuery.bind(this);

    this.firstLoad = this.firstLoad.bind(this);
    this.stateUpdate = this.stateUpdate.bind(this);
    this.handlePermalinkUpdate = this.handlePermalinkUpdate.bind(this);
  }

  getChildContext() {
    return {
      fetchQuery: this.fetchQuery,
      loadControl: this.loadControl,
      stateUpdate: this.stateUpdate
    };
  }

  componentDidMount() {
    if (this.props.permalink) {
      this.defaultQuery = parsePermalink(
        window.location,
        this.permalinkKeywords,
        this.defaultQuery
      );
    }

    this.firstLoad(this.defaultQuery);
  }

  componentDidUpdate(prevProps, prevState) {
    const {src, onChange} = this.props;
    const {load, query} = this.state;
    const {error} = load;

    if (src && prevProps.src !== src) {
      api.resetClient(src);
      this.setState(initialState(), this.firstLoad);
    }

    if (error && prevState.load.error !== error) {
      console.warn(error.stack);
      UIToaster.show({intent: load.severity, message: error.message});
    }

    if (onChange && !isSameQuery(prevProps.query, query)) {
      onChange(query, this.state.dataset, this.state.options);
    }

    if (
      query.cube &&
      this.queryHistory.findIndex(isSameQuery.bind(null, query)) === -1
    ) {
      this.queryHistory.push(query);
    }
  }

  handlePermalinkUpdate(location) {
    const query = parsePermalink(location, this.permalinkKeywords);
    const nextState = permalinkToState(this.state, query);
    this.loadControl(() => nextState, this.fetchQuery);
  }

  render() {
    const {location} = this.context.router;
    const {
      config,
      formatting,
      measureConfig,
      permalink,
      topojson,
      visualizations
    } = this.props;
    const {
      dataset,
      load,
      members,
      options,
      query,
      queryOptions
    } = this.state;

    console.log(dataset);

    return (
      <div
        className={classnames("vizbuilder", {
          loading: load.inProgress
        })}
      >
        <LoadingScreen total={load.total} progress={load.done} />
        <Sidebar
          defaultQuery={this.defaultQuery}
          options={options}
          query={query}
          queryOptions={queryOptions}
        />
        <ChartArea
          activeChart={query.activeChart}
          dataset={dataset}
          formatting={formatting}
          members={members}
          query={query}
          topojson={topojson}
          defaultConfig={config}
          measureConfig={measureConfig}
          visualizations={visualizations}
        />
        {permalink && <PermalinkManager
          activeChart={query.activeChart}
          href={location.search}
          keywords={this.permalinkKeywords}
          query={query}
          onPermalinkUpdate={this.handlePermalinkUpdate}
        />}
      </div>
    );
  }

  stateUpdate(newState) {
    return setStatePromise.call(this, state => mergeStates(state, newState));
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
}

Vizbuilder.contextTypes = {
  router: PropTypes.object
};

Vizbuilder.childContextTypes = {
  fetchQuery: PropTypes.func,
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
  // individual measureConfigs
  measureConfig: PropTypes.objectOf(PropTypes.object),
  // state update hook
  onChange: PropTypes.func,
  // permalink switch
  // to make the permalink work after in subsequent changes, pass any
  // object that reliably changes only when the url changes
  // the ideal element is react-router's `location.search` string
  permalink: PropTypes.bool,
  // permalink keywords to parse from the url
  permalinkKeywords: PropTypes.objectOf(PropTypes.string),
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
  permalink: true,
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
