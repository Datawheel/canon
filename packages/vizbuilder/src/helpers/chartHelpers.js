import {assign} from "d3plus-common";
import {
  BarChart,
  Donut,
  Geomap,
  LinePlot,
  Pie,
  StackedArea,
  Treemap
} from "d3plus-react";

import {getPermutations} from "./sorting";
import {areMetaMeasuresZero} from "./validation";

export const chartComponents = {
  barchart: BarChart,
  barchartyear: BarChart,
  donut: Donut,
  geomap: Geomap,
  lineplot: LinePlot,
  pie: Pie,
  stacked: StackedArea,
  treemap: Treemap
};

export const ALL_YEARS = "All years";
export const OWN_TIMELINE = ["barchartyear", "lineplot", "stacked"];

export function datagroupToCharts(datagroup, generalConfig) {
  const {measureName, levelName} = datagroup.names;

  const baseConfig = buildBaseConfig(datagroup, generalConfig);
  const topoConfig = generalConfig.topojson[levelName];
  const userConfig = assign(
    {},
    generalConfig.defaultConfig,
    generalConfig.measureConfig[measureName] || {}
  );

  const charts = datagroup.charts.reduce((sum, chartType) => {
    const setups = calcChartSetups(chartType, datagroup.query).map(setup => {
      const setupKeys = setup.map(lvl => lvl.annotations._key).join("_");
      return {
        ...datagroup,
        baseConfig,
        chartType,
        component: chartComponents[chartType],
        key: `${chartType}-${setupKeys}`,
        setup,
        topoConfig,
        userConfig
      };
    });
    return sum.concat(setups);
  }, []);

  return charts;
}

export function buildBaseConfig(datagroup, params) {
  const {aggType, formatter, names} = datagroup;
  const {measureName, timeLevelName} = names;
  const getMeasureValue = d => d[measureName];

  const config = {
    legend: false,
    duration: 0,

    total: (aggType === "SUM" || aggType === "UNKNOWN") && getMeasureValue,
    totalFormat: formatter,

    xConfig: {title: null},
    yConfig: {
      title: measureName,
      tickFormat: formatter
    },

    sum: getMeasureValue,
    value: getMeasureValue
  };

  config.tooltipConfig = tooltipGenerator(datagroup);

  if (timeLevelName && datagroup.members[timeLevelName].length > 1) {
    config.time = timeLevelName;
  }

  return config;
}

export function calcChartSetups(type, query) {
  switch (type) {
    case "treemap": {
      return getPermutations(query.levels);
    }

    default: {
      return [query.levels];
    }
  }
}

export function tooltipGenerator(datagroup) {
  const {formatter, names} = datagroup;
  const {levelName, measureName} = names;
  const shouldShow = areMetaMeasuresZero(names, datagroup.dataset);

  const tbody = Object.keys(datagroup.members)
    .filter(lvl => lvl !== levelName)
    .map(lvl => [lvl, d => d[lvl]]);
  tbody.push([measureName, d => formatter(d[measureName])]);

  if (shouldShow.lci && shouldShow.uci) {
    const {lciName, uciName} = names;
    tbody.push([
      "Confidence Interval",
      d =>
        `${formatter(d[lciName] * 1 || 0)} - ${formatter(d[uciName] * 1 || 0)}`
    ]);
  }
  else if (shouldShow.moe) {
    const {moeName} = names;
    tbody.push(["Margin of Error", d => `± ${formatter(d[moeName] * 1 || 0)}`]);
  }

  if (shouldShow.src) {
    const {sourceName} = names;
    tbody.push(["Source", d => `${d[sourceName]}`]);
  }

  if (shouldShow.clt) {
    const {collectionName} = names;
    tbody.push(["Collection", d => `${d[collectionName]}`]);
  }

  return {
    title: d => [].concat(d[levelName]).join(", "),
    tbody
  };
}
