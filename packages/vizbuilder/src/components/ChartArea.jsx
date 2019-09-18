import {NonIdealState} from "@blueprintjs/core";
import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

import createChartConfig from "../helpers/chartConfig";
import ChartCard from "./ChartCard";

class ChartArea extends React.Component {
  constructor(props) {
    super(props);

    this.scrollCall = undefined;

    this.handleChartSelect = this.handleChartSelect.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.scrollEnsure = this.scrollEnsure.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.activeChart !== nextProps.activeChart ||
      this.props.lastUpdate !== nextProps.lastUpdate ||
      this.props.selectedTime !== nextProps.selectedTime ||
      this.props.showConfidenceInt !== nextProps.showConfidenceInt
    );
  }

  componentDidUpdate() {
    requestAnimationFrame(this.dispatchResize);
    requestAnimationFrame(this.dispatchScroll);
  }

  dispatchScroll() {
    // TODO: Discuss how could we implement IntersectionObserver
    window.dispatchEvent(new CustomEvent("scroll"));
  }

  dispatchResize() {
    window.dispatchEvent(new CustomEvent("resize"));
  }

  handleChartSelect(type) {
    const uiParams = {activeChart: this.props.activeChart ? null : type};
    this.context.stateUpdate({uiParams});
  }

  handleTimeChange(date) {
    const selectedTime = date.getFullYear();
    this.context.stateUpdate({uiParams: {selectedTime}});
  }

  scrollEnsure() {
    clearTimeout(this.scrollCall);
    this.scrollCall = setTimeout(this.dispatchScroll, 400);
  }

  render() {
    const {activeChart, charts, measure} = this.props;

    const n = charts.length;
    if (n === 0) {
      return (
        <div className="area-chart empty">
          <NonIdealState visual="error" title="No results" />
        </div>
      );
    }

    const chartsToRender = activeChart
      ? charts.filter(chart => chart.key === activeChart)
      : charts;

    const isUniqueChart = n === 1;
    const isSingleChart = chartsToRender.length === 1;

    const uiParams = {
      activeChart,
      isSingle: isSingleChart,
      isUnique: isUniqueChart,
      onTimeChange: this.handleTimeChange,
      selectedTime: this.props.selectedTime,
      showConfidenceInt: this.props.showConfidenceInt
    };

    const unitConfig = this.props.unitsConfig[measure.annotations.units_of_measurement];

    return (
      <div className="area-chart" onScroll={this.scrollEnsure}>
        <div className="toolbar-wrapper">{this.props.children}</div>
        <div
          className={classNames(
            "wrapper chart-wrapper",
            isSingleChart ? "single" : "multi",
            isUniqueChart && "unique",
            activeChart
          )}
        >
          {chartsToRender.map(chart => {
            const {key} = chart;
            const config = createChartConfig(chart, uiParams);
            unitConfig && unitConfig(config, chart, uiParams);
            return (
              <ChartCard
                active={key === activeChart || isSingleChart}
                hideFooter={isUniqueChart}
                key={key}
                name={key}
                onSelect={this.handleChartSelect}
              >
                <chart.component config={config} />
              </ChartCard>
            );
          })}
        </div>
      </div>
    );
  }
}

ChartArea.contextTypes = {
  stateUpdate: PropTypes.func
};

ChartArea.propTypes = {
  activeChart: PropTypes.string,
  charts: PropTypes.arrayOf(PropTypes.object),
  lastUpdate: PropTypes.number,
  selectedTime: PropTypes.any,
  toolbar: PropTypes.any
};

ChartArea.defaultProps = {
  activeChart: null,
  charts: []
};

export default ChartArea;
