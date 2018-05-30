import React from "react";
import {Button, NonIdealState} from "@blueprintjs/core";

import createConfig, {charts} from "../helpers/chartconfig";
import {Treemap, Donut, Pie, BarChart, StackedArea} from "d3plus-react";

import "./ChartCard.css";

const icharts = {
  Treemap,
  Donut,
  Pie,
  BarChart,
  StackedArea
};

import "./AreaChart.css";

class AreaChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartConfig: {},
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
    // dd.hierarchy.dimension.dimensionType === 1
    const {type} = this.state;

    const aggregatorType = query.measure
      ? query.measure.annotations &&
        query.measure.annotations.aggregation_method
        ? query.measure.annotations.aggregation_method
        : query.measure.aggregatorType
      : "UNKNOWN";

    const name = query.measure && query.measure.name ? query.measure.name : "";

    const chartConfig = {
      type: type || "Treemap",
      colorScale: "value",
      measure2: query.measure ? query.measure.name : "",
      measure: {
        name,
        aggregatorType
      },
      dimension: query.drilldowns[0] ? query.drilldowns[0].name : "",
      groupBy: ""
    };

    if (!dataset.length) {
      return (
        <div className="area-chart empty">
          <NonIdealState visual="square" title="Empty dataset" />
        </div>
      );
    }

    console.log(dataset);

    const timeDim = "Year" in dataset[0];

    return (
      <div className="area-chart">
        <div className="wrapper">
          <div className={`chart-wrapper ${type || "multi"}`}>
            {Object.keys(charts).map(itype => {
              if (type && itype !== type) return null;
              if (/StackedArea|BarChart/.test(itype) && !timeDim) return null;
              if (
                /Treemap|Donut|Pie/.test(itype) &&
                chartConfig.measure.aggregatorType === "AVERAGE"
              ) {
                return null;
              }

              const ChartComponent = icharts[itype];

              chartConfig.type = itype;
              const config = createConfig(chartConfig);
              config.data = dataset;
              config.height = type ? 500 : 400;
              {

                /* <ChartComponent
                  key={itype}
                  type={itype}
                  config={config}
                  header={
                    
                  }
                  footer={}
                />*/
              }
              return (
                
                    <ChartComponent config={config} />
                    
              );
            }, this)}
          </div>
        </div>
      </div>
    );
  }
}

export default AreaChart;
