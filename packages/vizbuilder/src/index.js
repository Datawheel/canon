import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

import "@blueprintjs/labs/dist/blueprint-labs.css";
import "./index.css";

import LoadingScreen from "components/Loading";
import ChartArea from "./components/ChartArea";
import PermalinkManager from "./components/PermalinkManager";
import Sidebar from "./components/Sidebar";

import * as api from "./helpers/api";
import {fetchCubes, fetchQuery} from "./helpers/fetch";
import {loadControl, mergeStates, setStatePromise} from "./helpers/loadstate";
import {generateQueries} from "./helpers/query";
import {parsePermalink, permalinkToState} from "./helpers/permalink";
import {getDefaultGroup} from "./helpers/sorting";
import {isSameQuery} from "./helpers/validation";

import initialState from "./state";

class Vizbuilder extends React.PureComponent {
  constructor(props, ctx) {
    super(props);

    api.resetClient(props.src);
    this.state = initialState();

    const permalinkKeywords = {
      enlarged: "enlarged",
      filters: "filters",
      groups: "groups",
      measure: "measure",
      ...props.permalinkKeywords
    };

    const defaultGroup = [].concat(props.defaultGroup || []);
    const defaultMeasure = props.defaultMeasure;
    const defaultQuery = {defaultGroup, defaultMeasure};

    let initialStatePromise = fetchCubes(defaultQuery);
    const location = ctx.router.location;

    if (props.permalink && location.search) {
      const permalinkQuery = parsePermalink(permalinkKeywords, location);
      initialStatePromise = initialStatePromise.then(
        permalinkToState.bind(null, permalinkQuery)
      );
    }

    this.initialStatePromise = initialStatePromise;

    this.defaultQuery = defaultQuery;
    this.getDefaultGroup = getDefaultGroup.bind(null, defaultGroup);
    this.permalinkKeywords = permalinkKeywords;
    this.queryHistory = [];

    this.loadControl = loadControl.bind(this);
    this.fetchQueries = this.fetchQueries.bind(this);
    this.generateQueries = this.generateQueries.bind(this);
    this.stateUpdate = this.stateUpdate.bind(this);
  }

  getChildContext() {
    return {
      defaultQuery: this.defaultQuery,
      fetchQueries: this.fetchQueries,
      generateQueries: this.generateQueries,
      getDefaultGroup: this.getDefaultGroup,
      loadControl: this.loadControl,
      permalinkKeywords: this.permalinkKeywords,
      stateUpdate: this.stateUpdate
    };
  }

  componentDidMount() {
    const initialStatePromise = this.initialStatePromise;
    delete this.initialStatePromise;
    this.loadControl(
      () => initialStatePromise,
      this.generateQueries,
      this.fetchQueries
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const {onChange} = this.props;
    const {query} = this.state;

    if (!query.cube) return;

    if (!isSameQuery(prevState.query, query)) {
      onChange(query, this.state.options);

    //   if (this.queryHistory.findIndex(isSameQuery.bind(null, query)) === -1) {
    //     this.queryHistory.push(query);
    //   }
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
    const {load, datasets, members, queries, options, query} = this.state;

    return (
      <div
        className={classnames("vizbuilder", {
          loading: load.inProgress
        })}
      >
        <LoadingScreen total={load.total} progress={load.done} />
        <Sidebar options={options} query={query} />
        <ChartArea
          triggerUpdate={load.lastUpdate}
          activeChart={query.activeChart}
          defaultConfig={config}
          formatting={formatting}
          datasets={datasets}
          members={members}
          queries={queries}
          measureConfig={measureConfig}
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

  generateQueries() {
    return {queries: generateQueries(this.state.query)};
  }

  fetchQueries() {
    const {queries} = this.state;
    return Promise.all(queries.map(fetchQuery)).then(results => {
      const datasets = [];
      const members = [];
      let n = results.length;
      while (n--) {
        const result = results[n];
        datasets.unshift(result.dataset);
        members.unshift(result.members);
      }
      return {datasets, members};
    });
  }
}

Vizbuilder.contextTypes = {
  router: PropTypes.object
};

Vizbuilder.childContextTypes = {
  defaultQuery: PropTypes.any,
  fetchQueries: PropTypes.func,
  generateQueries: PropTypes.func,
  getDefaultGroup: PropTypes.func,
  loadControl: PropTypes.func,
  permalinkKeywords: PropTypes.object,
  stateUpdate: PropTypes.func
};

Vizbuilder.propTypes = {
  // this config object will be applied to all charts
  config: PropTypes.object,
  defaultMeasure: PropTypes.string,
  defaultGroup: PropTypes.arrayOf(PropTypes.string),
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
