import React from "react";
import {Button} from "@blueprintjs/core";

import {charts} from "../../helpers/chartconfig";

class ChartCard extends React.Component {
  render() {
    const {
      active,
      config,
      dataset,
      onSelect,
      query,
      type,
      yearSelector
    } = this.props;
    const ChartComponent = charts[type];

    config.data = dataset;

    return (
      <div className="chart-card">
        <div className="wrapper">
          <ChartComponent config={config} />

          <footer>
            {!(/StackedArea|LinePlot/).test(type) && yearSelector}
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
