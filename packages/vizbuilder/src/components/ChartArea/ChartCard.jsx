import React from "react";
import {Button} from "@blueprintjs/core";

import {charts} from "../../helpers/chartconfig";
import {relativeStdDev} from "../../helpers/math";

class ChartCard extends React.Component {
  render() {
    const {
      active,
      config,
      dataset,
      onSelect,
      type
    } = this.props;
    const ChartComponent = charts[type];

    config.data = dataset;

    if (type === "lineplot" && relativeStdDev(dataset, config.y) > 1) {
      config.yConfig.scale = "log";
      config.yConfig.gridConfig = {"stroke-width": 0};
    }

    return (
      <div className="chart-card">
        <div className="wrapper">
          <ChartComponent config={config} />

          <footer>
            <Button
              className="pt-minimal"
              iconName={active ? "cross" : "zoom-in"}
              text={active ? "CLOSE" : "ENLARGE"}
              onClick={onSelect}
            />
          </footer>
        </div>
      </div>
    );
  }
}

export default ChartCard;
