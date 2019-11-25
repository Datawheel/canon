import {Button} from "@blueprintjs/core";
import cn from "classnames";
import LoadingScreen from "components/Loading";
import debounce from "lodash/debounce";
import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import ButtonTooltip from "../components/ButtonTooltip";
import ControlArea from "../components/ControlArea";
import ChartArea from "../containers/ChartArea";
import {DEFAULT_MEASURE_FORMATTERS, DEFAULT_MEASURE_MULTIPLIERS} from "../helpers/format";
import {doCreateFilter, doCreateGroup, doSetup} from "../middleware/actions";
import {selectChartList} from "../store/charts/selectors";
import {selectMeasureList} from "../store/cubes/selectors";
import {selectLoadingState} from "../store/loading/selectors";
import {selectFilterKeys, selectGroupKeys} from "../store/query/selectors";
import ControlMeasure from "./ControlMeasure";
import ControlSources from "./ControlSources";
import ErrorExposer from "./ErrorExposer";
import FilterItem from "./FilterItem";
import GroupItem from "./GroupItem";
import Ranking from "./Ranking";

/**
 * @typedef OwnState
 * @property {boolean} isSidebarOpen
 */

/**
 * @typedef StateProps
 * @property {Chart[]} charts
 * @property {string | undefined} loadError
 * @property {string[]} filters
 * @property {string[]} groups
 * @property {boolean} isLoading
 * @property {number} loadDone
 * @property {number} loadTotal
 * @property {MeasureItem[]} measures
 */

/**
 * @typedef DispatchProps
 * @property {() => any} setupParameters
 * @property {() => void} createGroupHandler
 * @property {() => void} createFilterHandler
 */

/**
 * @extends {Component<import("react-i18next").WithNamespaces & import("..").VizbuilderProps & StateProps & DispatchProps, OwnState>}
 */
class Vizbuilder extends Component {
  state = {
    isSidebarOpen: true
  };

  resizeEnsureHandler = debounce(
    () => window.dispatchEvent(new CustomEvent("resize")),
    400
  );

  scrollEnsureHandler = debounce(
    () => window.dispatchEvent(new CustomEvent("scroll")),
    400
  );

  toggleSidebarHandler = () =>
    this.setState(
      state => ({isSidebarOpen: !state.isSidebarOpen}),
      this.resizeEnsureHandler
    );

  componentDidMount() {
    this.props.setupParameters();
  }

  render() {
    const {
      config: userConfig,
      controlsArea,
      createFilterHandler,
      createGroupHandler,
      filters,
      groups,
      isLoading,
      loadDone,
      loadError,
      loadTotal,
      measureConfig,
      measureUnitConfig,
      measures,
      sourcesArea,
      t: translate,
      titleArea,
      toolbarArea,
      topojson: topojsonConfig
    } = this.props;
    const {isSidebarOpen} = this.state;

    const formatters = {...DEFAULT_MEASURE_FORMATTERS, ...this.props.formatting};
    const multipliers = {...DEFAULT_MEASURE_MULTIPLIERS, ...this.props.multipliers};

    if (measures.length === 0) {
      return (
        <div className="vizbuilder fetching">
          {isLoading && <LoadingScreen progress={loadDone} total={loadTotal} />}
          {!isLoading && <ErrorExposer />}
        </div>
      );
    }

    return (
      <div className={cn("vizbuilder", {fetching: isLoading})}>
        {isLoading && <LoadingScreen progress={loadDone} total={loadTotal} />}

        <div className="area-sidebar" hidden={!isSidebarOpen}>
          <div className="wrapper">
            {titleArea}

            <ControlMeasure defaultTable={this.props.defaultTable} />

            <ControlArea
              className="control groups-manager"
              title={translate("Grouped by")}
              items={groups.map((key, index) => (
                <GroupItem key={key} identifier={key} index={index} />
              ))}
            >
              <Button
                className="control-action group-add"
                fill
                icon="insert"
                onClick={createGroupHandler}
                text={translate("Add grouping")}
              />
            </ControlArea>

            <ControlArea
              className="control filters-manager"
              title={translate("Filter by")}
              items={filters.map(key => (
                <FilterItem
                  formatters={formatters}
                  identifier={key}
                  key={key}
                  multipliers={multipliers}
                />
              ))}
            >
              <Button
                className="control-action filter-add"
                fill
                icon="insert"
                onClick={createFilterHandler}
                text={translate("Add filter")}
              />
            </ControlArea>

            {controlsArea}

            <ControlSources />

            {sourcesArea}

            <Ranking formatters={formatters} />
          </div>
        </div>

        <div className="area-middle">
          <ButtonTooltip
            className="toggle-sidebar"
            icon={isSidebarOpen ? "menu-closed" : "menu-open"}
            onClick={this.toggleSidebarHandler}
            title={isSidebarOpen ? "Hide Controls" : "Show Controls"}
          />
        </div>

        <div className="area-chart">
          <div className="wrapper">
            {toolbarArea}
            {loadError && <ErrorExposer />}
            {!loadError && (
              <ChartArea
                formatters={formatters}
                measureConfigs={measureConfig}
                measureUnitConfigFactories={measureUnitConfig}
                onResize={this.resizeEnsureHandler}
                onScroll={this.scrollEnsureHandler}
                topojsonConfigs={topojsonConfig}
                userConfig={userConfig}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

/** @type {import("react-redux").MapStateToProps<StateProps,import("..").VizbuilderProps,GeneralState>} */
function mapState(state) {
  const loading = selectLoadingState(state);
  return {
    charts: selectChartList(state),
    filters: selectFilterKeys(state),
    groups: selectGroupKeys(state),
    isLoading: loading.inProgress,
    loadDone: loading.done,
    loadError: loading.errorName,
    loadTotal: loading.total,
    measures: selectMeasureList(state)
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps,import("..").VizbuilderProps>} */
function mapDispatch(dispatch, props) {
  return {
    setupParameters() {
      dispatch(doSetup(props));
    },

    createGroupHandler() {
      dispatch(doCreateGroup());
    },

    createFilterHandler() {
      dispatch(doCreateFilter());
    }
  };
}

export default hot(withNamespaces()(connect(mapState, mapDispatch)(Vizbuilder)));
