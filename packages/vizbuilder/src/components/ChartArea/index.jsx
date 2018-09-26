import React from "react";
import PropTypes from "prop-types";
import {NonIdealState} from "@blueprintjs/core";
import {formatAbbreviate} from "d3plus-format";

import createChartConfig, {charts} from "../../helpers/chartconfig";
import ChartCard from "./ChartCard";

import "./style.css";

const DEFAULT_FORMATTERS = {
  Dollars: d => `$${formatAbbreviate(d * 1 || 0)}`
};

class ChartArea extends React.Component {
  constructor(props) {
    super(props);

    this.resizeCall = undefined;
    this.scrollCall = undefined;

    this.selectChart = this.selectChart.bind(this);
    this.scrollEnsure = this.scrollEnsure.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.activeChart !== nextProps.activeChart ||
      this.props.triggerUpdate !== nextProps.triggerUpdate
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

  render() {
    const {
      activeChart,
      defaultConfig,
      formatting,
      mainDataset,
      mainMembers,
      mainQuery,
      measureConfig,
      metaDatasets,
      metaMembers,
      metaQueries,
      topojson,
      visualizations
    } = this.props;

    if (!mainDataset.length) {
      return (
        <div className="area-chart empty">
          <NonIdealState visual="error" title="Empty dataset" />
        </div>
      );
    }

    const generalConfig = {
      defaultConfig,
      formatting: {
        ...DEFAULT_FORMATTERS,
        ...formatting
      },
      measureConfig,
      topojson,
      visualizations
    };

    const allQueries = [mainQuery].concat(metaQueries);
    const allDatasets = [mainDataset].concat(metaDatasets);
    const allMembers = [mainMembers].concat(metaMembers);

    const chartElements = [];

    let n = allQueries.length;

    while (n--) {
      const metaChart = metaQueries.includes(allQueries[n]);
      const chartConfigs = createChartConfig(
        allQueries[n],
        allDatasets[n],
        allMembers[n],
        activeChart,
        generalConfig,
        metaChart
      );
      const asdf = chartConfigs.map((chartConfig, i) => 
        <ChartCard
          active={chartConfig.key === activeChart}
          key={chartConfig.key}
          name={chartConfig.key}
          onSelect={this.selectChart}
        >
          <chartConfig.component config={chartConfig.config} />
        </ChartCard>
      );
      chartElements.unshift(...asdf);
    }

    return (
      <div className="area-chart" onScroll={this.scrollEnsure}>
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
  stateUpdate: PropTypes.func
};

ChartArea.propTypes = {
  activeChart: PropTypes.string,
  defaultConfig: PropTypes.object,
  formatting: PropTypes.objectOf(PropTypes.func),
  mainDataset: PropTypes.array,
  mainMembers: PropTypes.objectOf(PropTypes.array),
  mainQuery: PropTypes.object,
  measureConfig: PropTypes.object,
  metaDatasets: PropTypes.arrayOf(PropTypes.array),
  metaMembers: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.array)),
  metaQueries: PropTypes.arrayOf(PropTypes.object),
  topojson: PropTypes.objectOf(
    PropTypes.shape({
      topojson: PropTypes.string.isRequired,
      topojsonId: PropTypes.string,
      topojsonKey: PropTypes.string
    })
  ),
  triggerUpdate: PropTypes.number,
  visualizations: PropTypes.arrayOf(PropTypes.string)
};

ChartArea.defaultProps = {
  activeChart: null,
  mainDataset: []
};

export default ChartArea;
