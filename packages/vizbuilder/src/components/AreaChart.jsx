import React from "react";
import {NonIdealState} from "@blueprintjs/core";

import createChartConfig, {charts, ALL_YEARS} from "../helpers/chartconfig";
import ChartCard from "./ChartCard";

import "./_AreaChart.css";

class AreaChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeType: null,
      year: ALL_YEARS
    };

    this.actions = Object.keys(charts).reduce((box, type) => {
      box[type] = this.selectChart.bind(this, type);
      return box;
    }, {});

    this.resizeCall = undefined;
    this.scrollCall = undefined;

    this.scrollEnsure = this.scrollEnsure.bind(this);
    this.selectYear = this.selectYear.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.dataset !== nextProps.dataset ||
      this.state.activeType !== nextState.activeType ||
      this.state.year !== nextState.year
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
    this.setState(
      state => ({
        activeType: !state.activeType ? type : null
      }),
      () => {
        this.dispatchResize();
        this.dispatchScroll();
      }
    );
  }

  selectYear(evt) {
    this.setState({
      year: evt.target.value
    });
  }

  render() {
    const {dataset, query, members} = this.props;
    const {activeType} = this.state;
    const year = parseInt(this.state.year, 10) || ALL_YEARS;

    if (!dataset.length) {
      return (
        <div className="area-chart empty">
          <NonIdealState visual="error" title="Empty dataset" />
        </div>
      );
    }

    const yearSelector = Array.isArray(members.Year) &&
      <select onChange={this.selectYear} value={year}>
        <option value={ALL_YEARS}>All years</option>
        {members.Year.map(item =>
          <option key={item} value={item}>
            {item}
          </option>
        )}
      </select>
    ;

    const chartConfig = createChartConfig({
      activeType,
      availableKeys: new Set(Object.keys(members)),
      query,
      year
    });

    const filteredDataset =
      year !== ALL_YEARS
        ? dataset.filter(item => item.Year == year) // eslint-disable-line eqeqeq
        : dataset;

    const chartElements = chartConfig.map(chart =>
      <ChartCard
        key={chart.type}
        type={chart.type}
        active={chart.type === activeType}
        query={query}
        config={chart.config}
        dataset={filteredDataset}
        onSelect={this.actions[chart.type]}
        yearSelector={yearSelector}
      />
    );

    return (
      <div className="area-chart" onScroll={this.scrollEnsure}>
        <div className="wrapper">
          <div className={`chart-wrapper ${activeType || "multi"}`}>
            {chartElements}
          </div>
        </div>
      </div>
    );
  }
}

export default AreaChart;
