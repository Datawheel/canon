import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {NonIdealState} from "@blueprintjs/core";

import createChartConfig from "../../helpers/chartconfig";
import ChartCard from "./ChartCard";

import "./style.css";

const NO_CHARTS = (
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
    const {activeChart, charts, selectedTime, toolbar} = this.props;
    const state = this.state;

    const n = charts.length;
    if (n === 0) {
      return NO_CHARTS;
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
      selectedTime,
      uiheight: state.heightArea - state.heightToolbar,
    };

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
  datagroups: PropTypes.arrayOf(PropTypes.object),
  lastUpdate: PropTypes.number,
  selectedTime: PropTypes.any,
  toolbar: PropTypes.any
};

ChartArea.defaultProps = {
  activeChart: null,
  charts: [],
  datagroups: []
};

export default ChartArea;
