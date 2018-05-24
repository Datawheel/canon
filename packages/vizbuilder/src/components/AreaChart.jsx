import React from "react";
import {Button} from "@blueprintjs/core";

import createConfig, {charts} from "../helpers/chartconfig";
import ChartCard from "./ChartCard";

import "./AreaChart.css";
import "./PreviewDialog.css";

class AreaChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type: null,
      annotations: {
        source_link: "about:blank",
        source_name: "MINSAL"
      }
    };

    this.actions = {};
    this.resizeCall = 0;
  }

  toggleDialog(type = false) {
    if (type) {
      this.setState({
        chartConfig: {
          type,
          colorScale: "value",
          measure: "value",
          dimension: "parent"
        }
      });
    }
  }

  selectChart(type) {
    this.setState(state => ({
      type: !state.type ? type : null
    }));

    clearTimeout(this.resizeCall);
    this.resizeCall = setTimeout(
      () => window.dispatchEvent(new CustomEvent("resize")),
      500
    );
  }

  getAction(type) {
    if (!(type in this.actions)) {
      this.actions[type] = this.selectChart.bind(this, type);
    }
    return this.actions[type];
  }

  renderFooter(itype) {
    const {type, annotations} = this.state;

    return (
      <footer>
        {type
          ? <span className="source-note">
            <span className="source-note-txt">{"Source: "}</span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="source-note-link"
              href={annotations.source_link}
            >
              {annotations.source_name}
            </a>
          </span>
          : null}
        <Button
          className="pt-minimal"
          iconName={type ? "cross" : "zoom-in"}
          text={type ? "CLOSE" : "ENLARGE"}
          onClick={this.getAction.call(this, itype)}
        />
      </footer>
    );
  }

  render() {
    const {dataset, query} = this.props;
    const {type} = this.state;

    if (!dataset.length) return null;

    const chartConfig = {
      type: type || "Treemap",
      colorScale: "value",
      measure: query.measure ? query.measure.name : "",
      dimension: query.drilldowns[0] ? query.drilldowns[0].name : "",
      groupBy: ""
    };
    const config = createConfig(chartConfig);
    config.data = dataset;
    config.height = type ? 500 : 400;

    const timeDim = "Year" in dataset[0];

    return (
      <div className="area-chart">
        <div className="wrapper">
          <div className={`chart-wrapper ${type || "multi"}`}>
            {Object.keys(charts).map(function(itype) {
              if (type && itype !== type) return null;
              if (/StackedArea|BarChart/.test(itype) && !timeDim) return null;

              return (
                <ChartCard
                  key={itype}
                  type={itype}
                  config={config}
                  header={
                    <header>{`${itype} of ${chartConfig.measure} by ${
                      chartConfig.dimension
                    }`}</header>
                  }
                  footer={this.renderFooter.call(this, itype)}
                />
              );
            }, this)}
          </div>
        </div>
      </div>
    );
  }
}

export default AreaChart;
