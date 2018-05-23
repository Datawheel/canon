import React from "react";
import PropTypes from "prop-types";
import {uuid} from "d3plus-common";
import {Treemap, Donut, Pie, BarChart, StackedArea} from "d3plus-react";
import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  Intent,
  Tooltip
} from "@blueprintjs/core";

import RenderOnce from "./RenderOnce";
import "./AreaChart.css";
import "./PreviewDialog.css";

const components = {
  Treemap,
  Donut,
  Pie,
  BarChart,
  StackedArea
};

class AreaChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      chartConfig: {
        type: "Treemap",
        colorScale: "value",
        measure: "Output",
        dimension: "Year"
      },
      previewConfig: {
        type: "Treemap",
        colorScale: "value",
        measure: "Output",
        dimension: "Year"
      }
    };

    this.changePreview = this.changePreview.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.toggleDialog = this.toggleDialog.bind(this);
  }

  changePreview(type) {
    this.setState({
      isOpen: !this.state.isOpen,
      chartConfig: {
        type,
        measure: "Output",
        dimension: "Year"
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    // return nextState.isOpen !== this.state.isOpen;
    return true;
  }

  createConfig(data) {
    console.log(data);
    const {chartConfig} = this.state;
    const x = chartConfig.groupBy;

    // Confs of Viz
    const vizConfig = {
      groupBy: chartConfig.dimension,
      total: d => d[chartConfig.measure],
      totalConfig: {
        fontSize: 14
      },
      sum: d => d[chartConfig.measure],
      value: d => d[chartConfig.measure]
    };

    const colorScaleConfig = {
      colorScale: false,
      colorScaleConfig: {
        color: "#0D47A1",
        scale: "jenks"
      }
    };

    const barConfig = {
      x: "ID Year",
      xConfig: {
        title: x
      },
      discrete: "x",
      y: chartConfig.measure,
      yConfig: {
        title: chartConfig.measure
      }
    };

    const legendConfig = {
      label: false,
      shapeConfig: {
        width: 0,
        height: 0
      }
    };

    const timelineConfig = {
      // time: !isOpen ? "ID Year" : ""
    };

    const config = {
      ...vizConfig,
      ...barConfig,
      ...colorScaleConfig,
      ...timelineConfig,
      legendConfig,
      data,
      height: 400,
      uuid: uuid(),
      tooltipConfig: {
        title: `<h5 class="title xs-small">${chartConfig.measure}</h5>`
      }
    };

    if (chartConfig.type === "Geomap") config.colorScale = chartConfig.measure;
    if (chartConfig.groupBy) config.groupBy = chartConfig.groupBy;
    if (x) config.x = x;

    return config;
  }

  toggleDialog(type = false) {
    if (!this.state.isOpen) {
      this.setState({
        previewConfig: {
          type: "Treemap",
          colorScale: "value",
          measure: "value",
          dimension: "parent"
        }
      });
    }

    this.setState({isOpen: !this.state.isOpen});
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

  closeDialog() {
    this.setState({isOpen: false});
  }

  render() {
    const config = this.createConfig(this.context.dataset);

    console.log(this.context);

    const annotations = {
      source_link: "",
      source_name: ""
    };

    const CustomViz = components[this.state.chartConfig.type];
    console.log(CustomViz);
    const PreviewZoomViz = components[this.state.previewConfig.type];

    return (
      <div className="area-chart">
        <h4>
          {`${this.state.chartConfig.type} of ${
            this.state.chartConfig.measure
          } by ${this.state.chartConfig.dimension}`}
        </h4>
        {/* <div>
          <Button
            intent={Intent.PRIMARY}
            onClick={evt => this.toggleDialog()}
            text="Change chart"
          />
        </div>*/}
        <div className="viz-section-wrapper">
          {!this.state.isOpen &&
            Object.keys(components).map(comp => {
              const PreviewZoomViz = components[comp];
              return (
                <div className="viz-card" key={comp}>
                  <PreviewZoomViz
                    components={components}
                    chart={comp}
                    config={config}
                  />
                  <div className="viz-footer">
                    <a onClick={evt => this.changePreview(comp)}>ENLARGE</a>
                  </div>
                </div>
              );
            })}
        </div>

        {this.state.isOpen && 
          <div className="viz-card-wrapper">
            <CustomViz config={{...config, height: 500}} />
            <div className="viz-footer">
              <a
                onClick={evt => this.changePreview(this.state.chartConfig.type)}
              >
                CLOSE
              </a>
            </div>
          </div>
        }
        <div className="source-note">
          <span className="source-note-txt">{"Source"}:</span>
          <a
            target="_blank"
            className="source-note-link"
            href={annotations.source_link}
          >
            {annotations.source_name}
          </a>
        </div>
      </div>
    );
  }
}

AreaChart.contextTypes = {
  dataset: PropTypes.array
};

export default AreaChart;
