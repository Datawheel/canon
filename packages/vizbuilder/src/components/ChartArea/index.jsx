import React from "react";
import PropTypes from "prop-types";
import {NonIdealState} from "@blueprintjs/core";

import createChartConfig from "../../helpers/chartconfig";
import ChartCard from "./ChartCard";

import "./style.css";

const EMPTY_DATASETS = (
  <div className="area-chart empty">
    <NonIdealState visual="error" title="Empty dataset" />
  </div>
);

class ChartArea extends React.Component {
  constructor(props) {
    super(props);

    this.resizeCall = undefined;
    this.scrollCall = undefined;

    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.scrollEnsure = this.scrollEnsure.bind(this);
    this.selectChart = this.selectChart.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.activeChart !== nextProps.activeChart ||
      this.props.selectedTime !== nextProps.selectedTime ||
      this.props.lastUpdate !== nextProps.lastUpdate
    );
  }

  dispatchScroll() {
    // TODO: Discuss how could we implement IntersectionObserver
    window.dispatchEvent(new CustomEvent("scroll"));
  }

  dispatchResize() {
    window.dispatchEvent(new CustomEvent("resize"));
  }

  scrollEnsure() {
    clearTimeout(this.scrollCall);
    this.scrollCall = setTimeout(this.dispatchScroll, 400);
  }

  selectChart(type) {
    const query = {activeChart: this.props.activeChart ? null : type};
    this.context.stateUpdate({query}).then(() => {
      requestAnimationFrame(this.dispatchResize);
      requestAnimationFrame(this.dispatchScroll);
    });
  }

  handleTimeChange(date) {
    const selectedTime = date.getFullYear();
    this.context.stateUpdate({query: {selectedTime}});
  }

  render() {
    const {generalConfig} = this.context;
    const {
      activeChart,
      datasets,
      members,
      queries,
      selectedTime,
      toolbar
    } = this.props;

    if (!datasets.length) {
      return EMPTY_DATASETS;
    }

    const chartElements = [];

    let n = queries.length;

    while (n--) {
      const chartConfigs = createChartConfig(
        queries[n],
        datasets[n],
        members[n],
        {activeChart, selectedTime, onTimeChange: this.handleTimeChange},
        generalConfig
      );
      const configs = chartConfigs.map(chartConfig => (
        <ChartCard
          active={chartConfig.key === activeChart}
          key={chartConfig.key}
          name={chartConfig.key}
          onSelect={this.selectChart}
        >
          <chartConfig.component config={chartConfig.config} />
        </ChartCard>
      ));
      chartElements.unshift(...configs);
    }

    if (!chartElements.length) {
      return EMPTY_DATASETS;
    }

    return (
      <div className="area-chart" onScroll={this.scrollEnsure}>
        {toolbar && <div className="wrapper toolbar-wrapper">{toolbar}</div>}
        <div className="wrapper">
          <div className={`chart-wrapper ${activeChart || "multi"}`}>
            {chartElements}
          </div>
        </div>
      </div>
    );
  }
}

ChartArea.contextTypes = {
  generalConfig: PropTypes.object,
  stateUpdate: PropTypes.func
};

ChartArea.propTypes = {
  activeChart: PropTypes.string,
  datasets: PropTypes.arrayOf(PropTypes.array),
  lastUpdate: PropTypes.number,
  members: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.array)),
  queries: PropTypes.arrayOf(PropTypes.object)
};

ChartArea.defaultProps = {
  activeChart: null,
  datasets: [],
  members: [],
  queries: []
};

export default ChartArea;
