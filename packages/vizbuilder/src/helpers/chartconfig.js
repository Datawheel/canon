import {Treemap, Donut, Pie, BarChart, StackedArea} from "d3plus-react";
import {uuid} from "d3plus-common";

export const charts = {
  Treemap,
  Donut,
  Pie,
  BarChart,
  StackedArea
};

export const legendConfig = {
  label: false,
  shapeConfig: {
    width: 0,
    height: 0
  }
};

export const timelineConfig = {
  // time: !isOpen ? "ID Year" : ""
};

export const colorScaleConfig = {
  colorScale: false,
  colorScaleConfig: {
    color: "#0D47A1",
    scale: "jenks"
  }
};

export default function createConfig(chartConfig) {
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

  const config = {
    ...vizConfig,
    ...barConfig,
    ...colorScaleConfig,
    ...timelineConfig,
    legendConfig,
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
