import {formatAbbreviate} from "d3plus-format";
import React, {Fragment} from "react";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import {selectChartList} from "../store/charts/selectors";
import {
  selectActiveChart,
  selectMeasure,
  selectTimeLevelForCube,
  selectTimePeriod
} from "../store/query/selectors";

/**
 * @typedef OwnProps
 * @property {Record<string, (d: number) => string>} formatters
 */

/**
 * @typedef StateProps
 * @property {Chart} chart
 * @property {MeasureItem | undefined} [measure]
 * @property {LevelItem | undefined} [timeLevel]
 * @property {number | undefined} [timePeriod]
 */

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps & StateProps>} */
const Ranking = function({
  chart,
  formatters,
  measure,
  t: translate,
  timeLevel,
  timePeriod
}) {
  if (!chart || !timePeriod || !timeLevel || !measure || chart.data.length === 0) {
    return null;
  }

  const measureName = measure.name;
  const formatter = formatters[measureName] || formatAbbreviate;
  const {data, params} = chart;
  const timeLevelName = timeLevel.name;

  const levelNames = params.groups.map(group => group.level);
  const getLevelNames = a => levelNames.map(name => a[name]).join(" - ");

  const renderListItem = datapoint => (
    <li className="ranking-item">
      <div className="row">
        <span className="item-label">{getLevelNames(datapoint)}</span>
        <span className="item-value">{formatter(datapoint[measureName])}</span>
      </div>
    </li>
  );

  const selectedTimeDataset = data.filter(d => d[timeLevelName] == timePeriod);

  if (selectedTimeDataset.length === 1) {
    return null;
  }

  if (selectedTimeDataset.length < 20) {
    return (
      <fieldset className="control ranking">
        <legend className="label">
          {translate(`Ranking ({{timePeriod}})`, {timePeriod})}
        </legend>
        <ol className="ranking-list">{selectedTimeDataset.map(renderListItem)}</ol>
      </fieldset>
    );
  }

  const upperDataset = selectedTimeDataset.slice(0, 10);
  const lowerIndex = selectedTimeDataset.length - 10;
  const lowerDataset = selectedTimeDataset.slice(lowerIndex);

  return (
    <Fragment>
      <fieldset className="control ranking upper">
        <legend className="label">
          {translate(`Top 10 ({{timePeriod}})`, {timePeriod})}
        </legend>
        <ol className="ranking-upper">{upperDataset.map(renderListItem)}</ol>
      </fieldset>
      <fieldset className="control ranking lower">
        <legend className="label">
          {translate(`Bottom 10 ({{timePeriod}})`, {timePeriod})}
        </legend>
        <ol className="ranking-lower" start={lowerIndex + 1}>
          {lowerDataset.map(renderListItem)}
        </ol>
      </fieldset>
    </Fragment>
  );
};

/** @type {import("react-redux").MapStateToProps<StateProps, {}, GeneralState>} */
function mapState(state) {
  return {
    chart: selectActiveChart(state) || selectChartList(state)[0],
    measure: selectMeasure(state),
    timeLevel: selectTimeLevelForCube(state),
    timePeriod: selectTimePeriod(state)
  };
}

export default withNamespaces()(connect(mapState)(Ranking));
