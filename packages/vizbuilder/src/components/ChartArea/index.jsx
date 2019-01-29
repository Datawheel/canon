import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {NonIdealState} from "@blueprintjs/core";

import createChartConfig from "../../helpers/chartConfig";
import ChartCard from "./ChartCard";

import "./style.css";

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
      this.props.selectedTime !== nextProps.selectedTime
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
    const query = {activeChart: this.props.activeChart ? null : type};
    this.context.stateUpdate({query});
  }

  handleTimeChange(date) {
    const selectedTime = date.getFullYear();
    this.context.stateUpdate({query: {selectedTime}});
  }

  scrollEnsure() {
    clearTimeout(this.scrollCall);
    this.scrollCall = setTimeout(this.dispatchScroll, 400);
  }

  render() {
    const {activeChart, charts, selectedTime, toolbar} = this.props;

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

    const uiparams = {
      activeChart,
      isSingle: isSingleChart,
      isUnique: isUniqueChart,
      onTimeChange: this.handleTimeChange,
      selectedTime
    };

    return (
      <div className="area-chart" onScroll={this.scrollEnsure}>
        {toolbar && <div className="toolbar-wrapper">{toolbar}</div>}
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
            const config = createChartConfig(chart, uiparams);
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
