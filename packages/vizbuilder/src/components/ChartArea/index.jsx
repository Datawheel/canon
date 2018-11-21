import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
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

    this.state = {
      heightArea: 400,
      heightToolbar: props.toolbar ? 70 : 0
    };

    this.recalcAreaCall = undefined;
    this.scrollCall = undefined;

    this.areaNode = undefined;
    this.areaRef = node => {
      this.areaNode = node;
      this.recalcArea(node);
    };
    this.toolbarRef = node => {
      if (node) {
        const bounds = node.getBoundingClientRect();
        this.setState({heightToolbar: Math.ceil(bounds.height)});
      }
    };

    this.handleChartSelect = this.handleChartSelect.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.resizeAreaUpdate = this.resizeAreaUpdate.bind(this);
    this.scrollEnsure = this.scrollEnsure.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.activeChart !== nextProps.activeChart ||
      this.props.lastUpdate !== nextProps.lastUpdate ||
      this.props.selectedTime !== nextProps.selectedTime ||
      this.state.heightArea !== nextState.heightArea
    );
  }

  componentDidMount() {
    window.addEventListener("resize", this.resizeAreaUpdate);
  }

  componentDidUpdate() {
    requestAnimationFrame(this.dispatchResize);
    requestAnimationFrame(this.dispatchScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeAreaUpdate);
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

  recalcArea(node) {
    if (node) {
      const bounds = node.getBoundingClientRect();
      this.setState({heightArea: Math.floor(bounds.height) - 70});
    }
  }

  resizeAreaUpdate() {
    clearTimeout(this.recalcAreaCall);
    this.recalcAreaCall = setTimeout(
      this.recalcArea.bind(this, this.areaNode),
      400
    );
  }

  scrollEnsure() {
    clearTimeout(this.scrollCall);
    this.scrollCall = setTimeout(this.dispatchScroll, 400);
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
    const {heightArea, heightToolbar} = this.state;

    if (!datasets.length) {
      return EMPTY_DATASETS;
    }

    const chartElements = [];

    let n = queries.length;
    while (n--) {
      const configs = createChartConfig(
        queries[n],
        datasets[n],
        members[n],
        {activeChart, selectedTime, onTimeChange: this.handleTimeChange},
        generalConfig
      );
      chartElements.unshift.apply(chartElements, configs);
    }

    if (!chartElements.length) {
      return EMPTY_DATASETS;
    }

    const uniqueChart = !activeChart && chartElements.length === 1;
    const singleChart = activeChart || chartElements.length === 1;
    const chartHeight = uniqueChart
      ? heightArea - heightToolbar
      : singleChart
      ? heightArea - heightToolbar - 50
      : 400;

    return (
      <div
        className="area-chart"
        onScroll={this.scrollEnsure}
        ref={this.areaRef}
      >
        {toolbar && (
          <div className="toolbar-wrapper" ref={this.toolbarRef}>
            {toolbar}
          </div>
        )}
        <div
          className={classNames(
            "wrapper chart-wrapper",
            {unique: uniqueChart, single: singleChart, multi: !singleChart},
            activeChart
          )}
        >
          {chartElements.map(chartConfig => {
            const {config, key} = chartConfig;
            config.height = chartHeight;
            return (
              <ChartCard
                active={key === activeChart}
                key={key}
                name={key}
                onSelect={this.handleChartSelect}
              >
                <chartConfig.component config={config} />
              </ChartCard>
            );
          })}
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
