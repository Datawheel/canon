import React from "react";
import { uuid } from "d3plus-common";
import {
  Treemap,
  Donut,
  Pie,
  BarChart,
  StackedArea,
  Plot,
  LinePlot
} from "d3plus-react";
import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  Intent,
  Tooltip
} from "@blueprintjs/core";

import RenderOnce from "./RenderOnce";

import "@blueprintjs/core/dist/blueprint.css";
import "./AreaChart.css";
import "./PreviewDialog.css";

const components = {
  Treemap,
  Donut,
  Pie,
  BarChart,
  StackedArea
};

export default class AreaChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      chartConfig: {
        type: "Treemap",
        colorScale: "value",
        measure: "value",
        dimension: "id"
      },
      previewConfig: {
        type: "Treemap",
        colorScale: "value",
        measure: "value",
        dimension: "id"
      }
    };

    this.changePreview = this.changePreview.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.toggleDialog = this.toggleDialog.bind(this);
  }

  changePreview(type) {
    this.setState({
      previewConfig: {
        type
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    //return nextState.isOpen !== this.state.isOpen;
    return true;
  }

  createConfig(data) {
    const { chartConfig, isOpen } = this.state;
    const x = chartConfig.groupBy;

    // Confs of Viz
    const vizConfig = {
      total: d => d[chartConfig.measure],
      totalConfig: {
        fontSize: 14
      },
      sum: d => d[chartConfig.measure]
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
      //time: !isOpen ? "ID Year" : ""
    };

    let config = {
      ...vizConfig,
      ...barConfig,
      ...colorScaleConfig,
      ...timelineConfig,
      legendConfig,
      data,
      height: 125,
      uuid: uuid(),
      tooltipConfig: {
        title: `<h5 class="title xs-small">${chartConfig.measure}</h5>`
      }
    };

    /*if (["BarChart"].includes(type)) config = { ...config, ...barConfig };
    if (["Treemap", "Donut", "Pie"].includes(type)) {
      config = {...config, ...vizConfig};
    }*/

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

    this.setState({ isOpen: !this.state.isOpen });
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
    this.setState({ isOpen: false });
  }

  render() {
    const config = this.createConfig(this.props.dataset);

    const annotations = this.props.query.cube
      ? this.props.query.cube.annotations
      : {
          source_link: "",
          source_name: ""
        };

    const CustomViz = components[this.state.chartConfig.type];
    const PreviewZoomViz = components[this.state.previewConfig.type];

    return (
      <div className="area-chart">
        <Dialog
          icon="inbox"
          isOpen={this.state.isOpen}
          title="Dialog header"
          className="preview"
          onClose={evt => this.toggleDialog()}
        >
          <div className="pt-dialog-body">
            <div className="preview-body">
              <div className="preview-panel">
                {Object.keys(components).map(comp => (
                  <div key={comp} onClick={evt => this.changePreview(comp)}>
                    <RenderOnce
                      components={components}
                      chart={comp}
                      config={config}
                    />
                  </div>
                ))}
              </div>
              <div className="preview-main">
                <PreviewZoomViz config={{ ...config, height: 300 }} />
                This chart allow compare Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Nulla consectetur ipsum quis elit aliquet, ut
                viverra lorem finibus. Suspendisse vestibulum orci at felis
                hendrerit, eu viverra arcu rhoncus.
              </div>
            </div>
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button text="Cancel" onClick={evt => this.toggleDialog()} />
              <Button
                intent={Intent.PRIMARY}
                onClick={evt =>
                  this.toggleDialog(this.state.previewConfig.type)
                }
                text="Confirm"
              />
            </div>
          </div>
        </Dialog>
        <h4>
          {`${this.state.chartConfig.type} of ${
            this.state.chartConfig.measure
          } by ${this.state.chartConfig.dimension}`}
        </h4>
        <div>
          <Button
            intent={Intent.PRIMARY}
            onClick={evt => this.toggleDialog()}
            text="Change chart"
          />
        </div>
        <CustomViz config={{ ...config, height: 500 }} />
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
