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

    const title = `${type} of ${query.measure.name || ""} by ${query.drilldown
      .name || ""}`;

    config.data = dataset;

    return (
      <div className="chart-card">
        <div className="wrapper">
          <header>
            <span className="title">{title}</span>
            {!(/StackedArea|LinePlot/).test(type) && yearSelector}
          </header>

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
