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

    this.actions = Object.keys(charts).reduce((box, type) => {
      box[type] = this.selectChart.bind(this, type);
      return box;
    }, {});

    this.resizeCall = undefined;
    this.scrollCall = undefined;

    this.scrollEnsure = this.scrollEnsure.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.dataset !== nextProps.dataset ||
      this.props.visualizations !== nextProps.visualizations ||
      this.props.activeType !== nextProps.activeType
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
    this.context
      .stateUpdate({activeType: this.props.activeType ? null : type})
      .then(() => {
        requestAnimationFrame(this.dispatchResize);
        requestAnimationFrame(this.dispatchScroll);
      });
  }

  render() {
    const {
      activeType,
      dataset,
      formatting,
      members,
      query,
      topojson,
      userConfig,
      visualizations
    } = this.props;
    const actions = this.actions;

    if (!dataset.length) {
      return (
        <div className="area-chart empty">
          <NonIdealState visual="error" title="Empty dataset" />
        </div>
      );
    }

    const chartConfig = createChartConfig({
      activeType,
      formatting: {
        ...DEFAULT_FORMATTERS,
        ...formatting
      },
      members,
      query,
      topojson,
      userConfig,
      visualizations
    });

    const chartElements = chartConfig.map(chart => (
      <ChartCard
        key={chart.type}
        active={chart.type === activeType}
        config={chart.config}
        dataset={dataset}
        onSelect={actions[chart.type]}
        type={chart.type}
      />
    ));

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

ChartArea.contextTypes = {
  stateUpdate: PropTypes.func
};

ChartArea.propTypes = {
  activeType: PropTypes.string,
  dataset: PropTypes.array,
  formatting: PropTypes.objectOf(PropTypes.func),
  members: PropTypes.objectOf(PropTypes.array),
  query: PropTypes.object,
  topojson: PropTypes.objectOf(
    PropTypes.shape({
      topojson: PropTypes.string.isRequired,
      topojsonId: PropTypes.string,
      topojsonKey: PropTypes.string
    })
  ),
  userConfig: PropTypes.object,
  visualizations: PropTypes.arrayOf(PropTypes.string)
};

ChartArea.defaultProps = {
  activeType: null,
  dataset: []
};

export default ChartArea;
