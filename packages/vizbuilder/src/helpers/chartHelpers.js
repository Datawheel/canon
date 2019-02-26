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
import {joinStringsWithCommaAnd} from "./formatting";

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
      let key =
        datagroup.key +
        "-" +
        chartType +
        "-" +
        setup.map(lvl => lvl.annotations._key).join("") +
        datagroup.query.cuts.map(group => `-${group}`).join("");
      return {
        ...datagroup,
        baseConfig,
        chartType,
        component: chartComponents[chartType],
        key,
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
  const {levelNames, measureName, timeLevelName} = names;
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
    label: labelFunctionGenerator(...levelNames),

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
      const groupings = query.groups;
      const permutations = getPermutations(query.levels);
      /**
       * We must remove permutations where the first element is being cut by
       * 1 member, as these look the same in both orders.
       * @see Issue#434 on {@link https://github.com/Datawheel/canon/issues/434 | GitHub}
       */
      return permutations
        .filter(setup => {
          const level = setup[0];
          const grouping = groupings.find(grp => grp.level === level);
          return grouping.members.length !== 1;
        });
    }

    default: {
      return [query.levels];
    }
  }
}

/**
 * Generates the parameters for the tooltip shown for the current datagroup.
 * @param {Datagroup} datagroup The chart datagroup
 */
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
      d => `${formatter(d[lciName] * 1 || 0)} - ${formatter(d[uciName] * 1 || 0)}`
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

/**
 * Generates the function to render the labels in the shapes of a chart.
 * @param {string} lvlName1 Name of main level
 * @param {string} lvlName2 Name of secondary level
 */
export function labelFunctionGenerator(lvlName1, lvlName2) {
  return lvlName2
    ? d => `${d[lvlName1]} (${joinStringsWithCommaAnd(d[lvlName2])})`
    : d => d[lvlName1];
}

/**
 * Validates if the current query consists of a geographic levels along another
 * level with 1 cut.
 * @param {VbQuery} query The current Vizbuilder query object
 */
export function isGeoPlusUniqueCutQuery(query) {
  const geoLvl = query.geoLevel;
  const notGeoLvl = query.levels.find(lvl => lvl !== geoLvl);
  const notGeoLvlFullName = notGeoLvl.fullName;
  const notGeoLvlCut = query.cuts.find(cut => cut.key === notGeoLvlFullName);

  return notGeoLvlCut && notGeoLvlCut.values.length === 1;
}
