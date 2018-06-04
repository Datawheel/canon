import {Treemap, Donut, Pie, BarChart, StackedArea, Geomap} from "d3plus-react";
import {uuid} from "d3plus-common";

export const charts = {
  Treemap,
  Geomap,
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
  const dimension = chartConfig.dimension;

  // Confs of Viz
  const vizConfig = {
    groupBy: chartConfig.dimension,
    total: d => d[measure.name],
    totalConfig: {
      fontSize: 14
    },
    sum: d => d[measure.name],
    value: d => d[measure.name]
  };

  let config = {
    height: 400,
    legend: false,
    uuid: uuid(),
    tooltipConfig: {
      width: 60,
      title: d => `<h5 class="title xs-small">${d[dimension]}</h5>`,
      body: d => `<div>${measure.name}: ${d[measure.name]}</div>`
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
      y: measure.name,
      yConfig: {
        title: measure.name
      }
    };
  }
  else if (/StackedArea/.test(chartConfig.type)) {
    config = {
      ...config,
      ...vizConfig,
      x: "ID Year",
      xConfig: {
        title: x
      },
      discrete: "x",
      y: measure.name,
      yConfig: {
        title: measure.name
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
      colorScale: measure.name,
      //colorScalePosition: "left",
      colorScalePosition: "bottom",
      legend: false,
      colorScaleConfig: {
        scale: "jenks",
        height: 300,
        width: 200
        //align: "start"
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

  // groupBy: "ID Year",

  if (chartConfig.type === "Geomap") {
    // config.colorScale = measure.name;
    // config.colorScaleConfig.axisConfig.title = `Colored by ${measure}`;
  }

  if (chartConfig.type === "BarChart") {
    // config.time = "ID Year";
  }

  if (chartConfig.type === "StackedArea") {
    // config.groupBy = false;
    config.groupBy = chartConfig.dimension;
    config.x = "ID Year";
  }
  if (chartConfig.groupBy) config.groupBy = chartConfig.groupBy;
  if (x) config.x = x;

  return config;
}
