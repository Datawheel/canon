import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import {connect} from "react-redux";
import {Button} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";

import "@blueprintjs/labs/dist/blueprint-labs.css";
import "./index.css";

import LoadingScreen from "components/Loading";
import ChartArea from "./components/ChartArea";
import PermalinkManager from "./components/PermalinkManager";
import Sidebar from "./components/Sidebar";
import Filter from "./components/Sidebar/FilterManager/Filter";
import Ranking from "./components/Sidebar/Ranking";

import {resetClient} from "./helpers/api";
import {chartComponents} from "./helpers/chartHelpers";
import {fetchCubes} from "./helpers/fetch";
import {
  DEFAULT_MEASURE_FORMATTERS,
  DEFAULT_MEASURE_MULTIPLIERS,
  DEFAULT_MEASUREUNIT_CONFIG,
  normalizeFullNames
} from "./helpers/formatting";
import {fetchControl} from "./helpers/loadstate";
import {parsePermalink, permalinkToState} from "./helpers/permalink";
import {getDefaultGroup} from "./helpers/sorting";
import {isSameQuery, isDefaultQuery} from "./helpers/validation";

class Vizbuilder extends React.Component {
  constructor(props, ctx) {
    super(props);

    this.state = {
      showSidebar: true
    };

    let initialStatePromise = this.initialize(props);

    const location = ctx.router.location;
    if (props.permalink && location.search) {
      const permalinkQuery = parsePermalink(this.permalinkKeywords, location);
      initialStatePromise = initialStatePromise.then(
        permalinkToState.bind(null, permalinkQuery)
      );
    }

    this.initialStatePromise = initialStatePromise;

    this.loadControl = fetchControl.bind(this);
    this.stateUpdate = this.stateUpdate.bind(this);
    this.getGeneralConfig = this.getGeneralConfig.bind(this);
    this.getState = this.getState.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  initialize(props) {
    resetClient(props.src);

    Filter.formatters = {...DEFAULT_MEASURE_FORMATTERS, ...props.formatting};
    Filter.multipliers = {...DEFAULT_MEASURE_MULTIPLIERS, ...props.multipliers};

    const defaultGroup = normalizeFullNames(props.defaultGroup);
    const defaultMeasure = props.defaultMeasure;
    const defaultTable = props.tableLogic;
    const defaultQuery = {defaultGroup, defaultMeasure, defaultTable};

    this.getDefaultGroup = getDefaultGroup.bind(null, defaultGroup);
    this.getDefaultTable = defaultTable;
    this.isDefaultQuery = isDefaultQuery.bind(this, defaultQuery);
    this.permalinkKeywords = {
      enlarged: "enlarged",
      filters: "filters",
      groups: "groups",
      measure: "measure",
      ...props.permalinkKeywords
    };

    if (
      props.instanceKey !== props.reduxInstanceKey ||
      props.queryOptions.cubes.length === 0
    ) {
      props.dispatch({type: "VB_RESET", key: props.instanceKey});
      return fetchCubes(defaultQuery, props);
    }

    return Promise.resolve(this.getState());
  }

  getChildContext() {
    return {
      generalConfig: this.getGeneralConfig(),
      getDefaultGroup: this.getDefaultGroup,
      getDefaultTable: this.getDefaultTable,
      loadControl: this.loadControl,
      permalinkKeywords: this.permalinkKeywords,
      stateUpdate: this.stateUpdate
    };
  }

  componentDidMount() {
    const initialStatePromise = this.initialStatePromise;
    delete this.initialStatePromise;
    this.loadControl(() => initialStatePromise);
  }

  componentDidUpdate(prevProps) {
    const props = this.props;
    const {queryParams, uiParams} = props;

    if (!queryParams.cube) return;

    if (
      !isSameQuery(prevProps.queryParams, queryParams) ||
      prevProps.uiParams.activeChart === uiParams.activeChart
    ) {
      props.onChange(queryParams, uiParams, props.charts);
    }
  }

  render() {
    const {location} = this.context.router;
    const {
      permalink,
      toolbar,
      charts,
      datagroups,
      load,
      queryOptions,
      queryParams,
      uiParams
    } = this.props;
    const {showSidebar} = this.state;

    const chartForRanking = datagroups.filter(ch => !ch.quirk).pop();

    return (
      <div
        className={classnames("vizbuilder", {
          mapmode: Boolean(queryOptions.geomapLevels),
          fetching: load.inProgress
        })}
      >
        {load.inProgress && <LoadingScreen total={load.total} progress={load.done} />}
        <Sidebar
          groupLimit={this.props.groupLimit}
          options={queryOptions}
          isDefaultQuery={this.isDefaultQuery(queryParams)}
          query={queryParams}
          uiParams={uiParams}
          hidden={!showSidebar}
        >
          {this.props.children}
          <Ranking chart={chartForRanking} selectedTime={uiParams.selectedTime} />
        </Sidebar>
        <div className="area-middle">
          <Tooltip2
            className="toggle-sidebar"
            content={showSidebar ? "Hide Controls" : "Show Controls"}
            placement="auto"
          >
            <Button
              onClick={this.toggleSidebar}
              iconName={showSidebar ? "menu-closed" : "menu-open"}
            />
          </Tooltip2>
        </div>
        <ChartArea
          charts={charts}
          lastUpdate={load.lastUpdate}
          measure={queryParams.measure}
          unitsConfig={DEFAULT_MEASUREUNIT_CONFIG}
          {...uiParams}
        >
          {toolbar}
        </ChartArea>
        {permalink && <PermalinkManager
          activeChart={uiParams.activeChart}
          href={location.search}
          state={this.getState()}
        />}
      </div>
    );
  }

  getState() {
    const props = this.props;
    return {
      charts: props.charts,
      datagroups: props.datagroups,
      load: props.load,
      options: props.queryOptions,
      query: props.queryParams,
      uiParams: props.uiParams
    };
  }

  getGeneralConfig() {
    const props = this.props;
    return {
      defaultConfig: props.config,
      formatting: {...DEFAULT_MEASURE_FORMATTERS, ...props.formatting},
      multipliers: {...DEFAULT_MEASURE_MULTIPLIERS, ...props.multipliers},
      measureConfig: props.measureConfig,
      topojson: props.topojson,
      visualizations: []
        .concat(props.visualizations)
        .filter(viz => chartComponents.hasOwnProperty(viz))
    };
  }

  stateUpdate(newState) {
    return this.props.dispatch({type: "VB_STATE_UPDATE", state: newState});
  }

  toggleSidebar() {
    this.setState(
      state => ({showSidebar: !state.showSidebar}),
      () => window.dispatchEvent(new CustomEvent("resize"))
    );
  }
}

Vizbuilder.contextTypes = {
  router: PropTypes.object,
  store: PropTypes.object
};

Vizbuilder.childContextTypes = {
  generalConfig: PropTypes.object,
  getDefaultGroup: PropTypes.func,
  getDefaultTable: PropTypes.func,
  loadControl: PropTypes.func,
  permalinkKeywords: PropTypes.object,
  stateUpdate: PropTypes.func
};

Vizbuilder.propTypes = {
  config: PropTypes.object,
  datacap: PropTypes.number,
  defaultGroup: PropTypes.arrayOf(PropTypes.string),
  defaultMeasure: PropTypes.string,
  formatting: PropTypes.objectOf(PropTypes.func),
  groupLimit: PropTypes.number,
  measureConfig: PropTypes.objectOf(PropTypes.object),
  onChange: PropTypes.func,
  permalink: PropTypes.bool,
  permalinkKeywords: PropTypes.objectOf(PropTypes.string),
  src: PropTypes.string.isRequired,
  tableLogic: PropTypes.func,
  toolbar: PropTypes.element,
  topojson: PropTypes.objectOf(
    PropTypes.shape({
      topojson: PropTypes.string.isRequired,
      topojsonId: PropTypes.string,
      topojsonKey: PropTypes.string
    })
  ),
  visualizations: PropTypes.arrayOf(PropTypes.string)
};

Vizbuilder.defaultProps = {
  config: {},
  datacap: 20000,
  formatting: {},
  groupLimit: 3,
  instanceKey: "vizbuilder",
  measureConfig: {},
  multipliers: {},
  onChange() {},
  permalink: true,
  topojson: {},
  visualizations: [
    "geomap",
    "treemap",
    "barchart",
    "lineplot",
    "barchartyear",
    "stacked"
  ]
};

export default connect(state => {
  const vb = state.vizbuilder;
  return {
    charts: vb.charts,
    datagroups: vb.datagroups,
    reduxInstanceKey: vb.instanceKey,
    load: vb.load,
    queryOptions: vb.options,
    queryParams: vb.query,
    uiParams: vb.uiParams
  };
})(Vizbuilder);
