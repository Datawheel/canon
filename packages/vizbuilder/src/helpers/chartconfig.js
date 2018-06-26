import {
  Treemap,
  Donut,
  Pie,
  BarChart,
  StackedArea,
  Geomap,
  LinePlot
} from "d3plus-react";
import {uuid} from "d3plus-common";
import {formatAbbreviate} from "d3plus-format";

export const charts = {
  Treemap,
  Geomap,
  LinePlot,
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
  const measure = chartConfig.measure;
  const measureName = measure.name;
  const dimension = chartConfig.dimension;
  const moe = chartConfig.moe;

  // Confs of Viz
  const vizConfig = {
    groupBy: chartConfig.dimension,
    loadingMessage: "Loading",
    total: d => d[measureName],
    totalConfig: {
      fontSize: 14
    },
    sum: d => d[measureName],
    value: d => d[measureName]
  };

  let config = {
    height: 400,
    legend: false,
    uuid: uuid(),
    tooltipConfig: {
      width: 60,
      title: d => `<h5 class="title xs-small">${d[dimension]}</h5>`,
      body: d =>
        `<div>${measureName}: ${formatAbbreviate(d[measureName])}</div>`
    }
  };

  if (/BarChart/.test(chartConfig.type)) {
    config = {
      ...config,
      groupBy: "ID Year",
      x: "ID Year",
      xConfig: {
        title: x
      },
      discrete: "x",
      y: measureName,
      yConfig: {
        title: measureName
      }
    };
  }
  else if (/StackedArea|LinePlot/.test(chartConfig.type)) {
    config = {
      ...config,
      ...vizConfig,
      x: "ID Year",
      xConfig: {
        title: x
      },
      discrete: "x",
      y: measureName,
      yConfig: {
        title: measureName
      }
    };
  }
  else if (/Geomap/.test(chartConfig.type)) {
    config = {
      ...config,
      tiles: false,
      id: "ID State",
      topojsonId: "id",
      topojsonKey: "states",
      groupBy: "ID State",
      topojson: "/topojson/states.json",
      ocean: "transparent",
      projection: "geoAlbersUsa",
      colorScale: measureName,
      colorScalePosition: "bottom",
      legend: false,
      colorScaleConfig: {
        scale: "jenks",
        height: 500,
        width: 900
      },
      duration: 0,
      zoom: true,
      zoomFactor: 2,
      zoomScroll: false
    };
  }
  else {
    config = {
      ...config,
      ...vizConfig
    };
  }

  if (chartConfig.type === "BarChart") {
    config.tooltipConfig = {
      width: 60,
      title: d => `<h5 class="title xs-small">${d["ID Year"]}</h5>`,
      body: d =>
        `<div>${measureName}: ${formatAbbreviate(d[measureName])}</div>`
    };
  }

  if (chartConfig.type === "LinePlot" && moe) {
    config.confidence = [
      d => d[measureName] - d[moe],
      d => d[measureName] + d[moe]
    ];
    config.confidenceConfig = {
      fillOpacity: 0.15
    };
    config.tooltipConfig = {
      width: 60,
      title: d => `<h5 class="title xs-small">${d[dimension]}</h5>`,
      body: d =>
        "<div>" +
        `<div>${measureName}: ${formatAbbreviate(d[measureName])}</div>` +
        `<div>MOE: ±${formatAbbreviate(d[moe])}</div>` +
        "</div>"
    };
  }

  if (chartConfig.type === "StackedArea") {
    config.groupBy = chartConfig.dimension;
    config.x = "ID Year";
  }
  if (chartConfig.groupBy) config.groupBy = chartConfig.groupBy;
  if (x) config.x = x;

  return config;
}
