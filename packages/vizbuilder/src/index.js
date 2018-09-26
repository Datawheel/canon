import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import {Position, Toaster} from "@blueprintjs/core";

import {fetchCubes, fetchMainQuery, fetchMetaQueries} from "./actions/fetch";
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
  constructor(props, ctx) {
    super(props);

    api.resetClient(props.src);
    this.state = initialState();

    const permalinkKeywords = {
      dimension: "dimension",
      enlarged: "enlarged",
      filters: "filters",
      level: "level",
      measure: "measure",
      ...props.permalinkKeywords
    };

    const defaultQuery = {
      defaultMeasure: props.defaultMeasure,
      defaultDimension: props.defaultDimension,
      defaultLevel: props.defaultLevel
    };

    let initialStatePromise = fetchCubes.call(this, defaultQuery);
    const location = ctx.router.location;

    if (props.permalink && location.search) {
      parsePermalink(permalinkKeywords, location, defaultQuery);
      initialStatePromise = initialStatePromise.then(state =>
        permalinkToState(state, defaultQuery)
      );
    }

    this.initialStatePromise = initialStatePromise;

    this.defaultQuery = defaultQuery;
    this.permalinkKeywords = permalinkKeywords;
    this.queryHistory = [];

    this.loadControl = loadControl.bind(this);
    this.fetchQuery = this.fetchQuery.bind(this);
    this.stateUpdate = this.stateUpdate.bind(this);
  }

  getChildContext() {
    return {
      defaultQuery: this.defaultQuery,
      fetchQuery: this.fetchQuery,
      loadControl: this.loadControl,
      permalinkKeywords: this.permalinkKeywords,
      stateUpdate: this.stateUpdate
    };
  }

  componentDidMount() {
    const initialStatePromise = this.initialStatePromise;
    delete this.initialStatePromise;
    this.loadControl(() => initialStatePromise, this.fetchQuery);
  }

  componentDidUpdate(prevProps, prevState) {
    const {onChange} = this.props;
    const {load, query} = this.state;
    const {error} = load;

    if (error && prevState.load.error !== error) {
      console.warn(error.stack);
      UIToaster.show({intent: load.severity, message: error.message});
    }

    if (!query.cube) return;

    if (!isSameQuery(prevState.query, query)) {
      onChange(query, this.state.dataset, this.state.options);

      if (this.queryHistory.findIndex(isSameQuery.bind(null, query)) === -1) {
        this.queryHistory.push(query);
      }
    }
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
      metaDatasets,
      metaMembers,
      metaQueries,
      options,
      query
    } = this.state;

    return (
      <div
        className={classnames("vizbuilder", {
          loading: load.inProgress
        })}
      >
        <LoadingScreen total={load.total} progress={load.done} />
        <Sidebar
          options={options}
          query={query}
        />
        <ChartArea
          triggerUpdate={load.lastUpdate}
          activeChart={query.activeChart}
          defaultConfig={config}
          formatting={formatting}
          mainDataset={dataset}
          mainMembers={members}
          mainQuery={query}
          measureConfig={measureConfig}
          metaDatasets={metaDatasets}
          metaMembers={metaMembers}
          metaQueries={metaQueries}
          topojson={topojson}
          visualizations={visualizations}
        />
        {permalink && <PermalinkManager
          activeChart={query.activeChart}
          href={location.search}
          state={this.state}
        />}
      </div>
    );
  }

  stateUpdate(newState) {
    return setStatePromise.call(this, state => mergeStates(state, newState));
  }

  fetchQuery() {
    return Promise.all([
      fetchMainQuery(this.state.query),
      fetchMetaQueries(this.state.metaQueries)
    ]).then(results => ({...results[0], ...results[1]}));
  }
}

Vizbuilder.contextTypes = {
  router: PropTypes.object
};

Vizbuilder.childContextTypes = {
  defaultQuery: PropTypes.any,
  fetchQuery: PropTypes.func,
  loadControl: PropTypes.func,
  permalinkKeywords: PropTypes.object,
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
  onChange() {},
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
