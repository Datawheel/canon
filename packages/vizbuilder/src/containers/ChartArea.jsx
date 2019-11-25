import classNames from "classnames";
import React, {memo} from "react";
import {connect} from "react-redux";
import ChartCard from "../components/ChartCard";
import createChartConfig from "../helpers/chartConfig";
import {chartComponents} from "../helpers/chartHelpers";
import {doUpdatePermalink} from "../middleware/actions";
import {selectChartList} from "../store/charts/selectors";
import {selectLocale} from "../store/instance/selectors";
import {doChartUpdate, doPeriodUpdate} from "../store/query/actions";
import {
  selectActiveChartKey,
  selectShowConfInt,
  selectTimePeriod
} from "../store/query/selectors";

/**
 * @typedef OwnProps
 * @property {Record<string, (d: number) => string>} formatters
 * @property {Record<string, Partial<import("../types/d3plus").D3plusConfig>> | undefined} measureConfigs
 * @property {Record<string, (chart: Chart, uiParams: any) => Partial<import("../types/d3plus").D3plusConfig>> | undefined} measureUnitConfigFactories
 * @property {() => any} onResize
 * @property {() => any} onScroll
 * @property {Partial<import("../types/d3plus").D3plusConfig> | undefined} topojsonConfigs
 * @property {Partial<import("../types/d3plus").D3plusConfig> | undefined} userConfig
 */

/**
 * @typedef StateProps
 * @property {string?} activeChart
 * @property {Chart[]} charts
 * @property {string} locale
 * @property {boolean} showConfidenceInt
 * @property {number | undefined} timePeriod
 */

/**
 * @typedef DispatchProps
 * @property {() => any} restoreChartsHandler
 * @property {(chartKey: string) => any} chartSelectHandler
 * @property {(period: Date) => any} timeSelectHandler
 */

/** @type {React.FC<OwnProps & StateProps & DispatchProps>} */
const ChartArea = memo(function({
  activeChart,
  charts,
  formatters,
  locale,
  measureConfigs = {},
  onScroll,
  restoreChartsHandler,
  chartSelectHandler,
  timeSelectHandler,
  showConfidenceInt,
  timePeriod,
  topojsonConfigs = {},
  userConfig = {}
}) {
  const isUniqueChart = charts.length === 1;

  const chartsToRender =
    !isUniqueChart && activeChart
      ? charts.filter(chart => chart.key === activeChart)
      : charts;

  const isSingleChart = chartsToRender.length === 1;

  return (
    <div
      className={classNames(
        "chart-wrapper",
        isSingleChart ? "single" : "multi",
        isUniqueChart && "unique",
        activeChart
      )}
      onScroll={onScroll}
    >
      {chartsToRender.map(chart => {
        const {chartType, key} = chart;
        const {measure, geoLevel} = chart.params;
        const measureName = measure.name;
        const geoLevelName = geoLevel ? geoLevel.caption : "";

        const config = createChartConfig(chart, {
          activeChart,
          formatters,
          isSingleChart,
          isUniqueChart,
          locale,
          measureConfig: measureConfigs[measureName],
          onTimeChange: timeSelectHandler,
          showConfidenceInt,
          timePeriod,
          topojsonConfig: topojsonConfigs[geoLevelName],
          userConfig
        });

        return (
          <ChartCard
            active={key === activeChart || isSingleChart}
            chart={chartComponents[chartType]}
            config={config}
            hideToolbar={isUniqueChart}
            key={key}
            onToggle={activeChart ? restoreChartsHandler : () => chartSelectHandler(key)}
          />
        );
      })}
    </div>
  );
}, areEqual);

/**
 * @param {OwnProps & StateProps & DispatchProps} prevProps
 * @param {OwnProps & StateProps & DispatchProps} nextProps
 */
function areEqual(prevProps, nextProps) {
  return (
    prevProps.activeChart === nextProps.activeChart &&
    prevProps.charts === nextProps.charts &&
    prevProps.timePeriod === nextProps.timePeriod
  );
}

/** @type {import("react-redux").MapStateToProps<StateProps,OwnProps,GeneralState>} */
function mapState(state) {
  return {
    activeChart: selectActiveChartKey(state),
    charts: selectChartList(state),
    locale: selectLocale(state),
    showConfidenceInt: selectShowConfInt(state),
    timePeriod: selectTimePeriod(state)
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps,OwnProps>} */
function mapDispatch(dispatch, props) {
  return {
    restoreChartsHandler() {
      dispatch(doChartUpdate(null));
      dispatch(doUpdatePermalink());
      props.onResize && props.onResize();
    },

    chartSelectHandler(chartKey) {
      dispatch(doChartUpdate(chartKey));
      dispatch(doUpdatePermalink());
      props.onResize && props.onResize();
    },

    timeSelectHandler(date) {
      const period = date.getUTCFullYear();
      dispatch(doPeriodUpdate(period));
      dispatch(doUpdatePermalink());
      props.onResize && props.onResize();
    }
  };
}

export default connect(mapState, mapDispatch)(ChartArea);
