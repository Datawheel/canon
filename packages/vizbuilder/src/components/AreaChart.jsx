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
// import "styles/Chart.css";
// import "styles/PreviewViz.css";

const components = {
  Treemap,
  Donut,
  Pie,
  BarChart
};

export default class AreaChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      hasMounted: false,
      data: [],
      chart: {
        type: "Treemap"
      },
      preview: {
        type: "Treemap"
      }
    };

    this.changePreview = this.changePreview.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.toggleDialog = this.toggleDialog.bind(this);
  }

  changePreview(type) {
    this.setState({
      preview: {
        type
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.isOpen !== this.state.isOpen;
    //return true;
  }

  createConfig(groupBy, measure, type, data, cuts = []) {
    const x = groupBy;
    const cutString =
      cuts.length > 0
        ? `Filtered By ${cuts.map(cut => cut.name).join(", ")}`
        : "";

    // Confs of Viz
    const vizConfig = {
      sum: d => d[measure]
    };

    const barConfig = {
      x,
      xConfig: {
        title: x
      },
      y: measure,
      yConfig: {
        title: measure
      }
    };

    const axisConfig = {};

    let config = {
      ...vizConfig,
      data,
      height: 125,
      uuid: uuid(),
      tooltipConfig: {
        title: `<h5 class="title xs-small">${measure}</h5>`
      }
    };

    if (["BarChart"].includes(type)) config = { ...config, ...barConfig };
    /*if (["Treemap", "Donut", "Pie"].includes(type)) {
      config = {...config, ...vizConfig};
    }*/

    if (type === "Geomap") config.colorScale = measure;
    if (groupBy) config.groupBy = groupBy;
    if (x) config.x = x;

    return config;
  }

  toggleDialog(type = false) {
    if (!this.state.isOpen) this.setState({ preview: { type: "Treemap" } });
    this.setState({ isOpen: !this.state.isOpen });
    if (type) this.setState({ chart: { type } });
  }

  closeDialog() {
    this.setState({ isOpen: false });
  }

  render() {
    const props = {
      chart: {
        type: this.state.chart.type,
        data: [
          { parent: "Group 1", id: "alpha", value: 29 },
          { parent: "Group 1", id: "beta", value: 10 },
          { parent: "Group 1", id: "gamma", value: 2 },
          { parent: "Group 2", id: "delta", value: 29 },
          { parent: "Group 2", id: "eta", value: 25 }
        ]
      }
    };

    const config = this.createConfig(
      "parent",
      "value",
      props.chart.type,
      props.chart.data
    );

    const CustomViz = components[this.state.chart.type];
    const PreviewZoomViz = components[this.state.preview.type];
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
                This chart allow compare .....
              </div>
            </div>
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button text="Cancel" onClick={evt => this.toggleDialog()} />
              <Button
                intent={Intent.PRIMARY}
                onClick={evt => this.toggleDialog(this.state.preview.type)}
                text="Confirm"
              />
            </div>
          </div>
        </Dialog>
        <div>
          <Button
            intent={Intent.PRIMARY}
            onClick={evt => this.toggleDialog()}
            text="Change chart"
          />
        </div>
        <CustomViz config={{ ...config, height: 500 }} />
      </div>
    );
  }
}
