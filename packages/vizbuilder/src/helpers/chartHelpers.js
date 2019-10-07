import {assign} from "d3plus-common";
import {BarChart, Donut, Geomap, LinePlot, Pie, StackedArea, Treemap} from "d3plus-react";
import {captionOrName, joinStringsWithCommaAnd} from "./formatting";
import {getPermutations} from "./sorting";
import {areMetaMeasuresZero, isValidFilter} from "./validation";

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
    const setups = calcChartSetups(datagroup, chartType).map(setup => ({
      ...datagroup,
      baseConfig,
      chartType,
      component: chartComponents[chartType],
      setup,
      topoConfig,
      userConfig
    }));
    return sum.concat(setups);
  }, []);

  return charts;
}

export function buildBaseConfig(datagroup, params) {
  const {aggType, formatter, names} = datagroup;
  const {measure} = datagroup.query;
  const {levelNames, measureName, timeLevelName} = names;
  const getMeasureValue = d => d[measureName];

  const config = {
    legend: false,
    duration: 0,

    total: false,
    totalFormat: d => `Total: ${formatter(d)}`,

    xConfig: {title: null},
    yConfig: {
      title: measureName,
      tickFormat: formatter
    },
    label: labelFunctionGenerator(...levelNames),

    sum: getMeasureValue,
    value: getMeasureValue
  };

  const measureUnit = measure.annotations.units_of_measurement;
  if (
    ["Percentage", "Rate"].indexOf(measureUnit) === -1 &&
    ["SUM", "UNKNOWN"].indexOf(aggType) > -1
  ) {
    config.total = getMeasureValue;
  }

  config.tooltipConfig = tooltipGenerator(datagroup);

  if (timeLevelName && datagroup.members[timeLevelName].length > 1) {
    config.time = timeLevelName;
  }

  return config;
}

/**
 * @param {import("./chartCriteria").Datagroup} datagroup
 * @param {string} type
 */
export function calcChartSetups(datagroup, type) {
  const {members, query} = datagroup;

  switch (type) {
    case "treemap": {
      const relevantLevels = query.levels.filter(
        lvl => (members[captionOrName(lvl)] || []).length > 1
      );
      return getPermutations(relevantLevels);
    }

    default: {
      return [query.levels];
    }
  }
}

/**
 * Generates the parameters for the tooltip shown for the current datagroup.
 * @param {import("./chartCriteria").Datagroup} datagroup The chart datagroup
 */
export function tooltipGenerator(datagroup) {
  const {formatter, names} = datagroup;
  const {levelName, measureName} = names;
  const {filters} = datagroup.query;
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

  if (Array.isArray(filters)) {
    filters.forEach(filter => {
      if (isValidFilter(filter)) {
        const formatter = filter.getFormatter();
        tbody.push([captionOrName(filter), d => `${formatter(d[filter.name])}`]);
      }
    });
  }

  return {
    title: d => [].concat(d[levelName]).join(", "),
    tbody
  };
}

/**
 * Generates the function to render the labels in the shapes of a chart.
 * @param {...string} arguments
 */
export function labelFunctionGenerator() {
  const [lvlName1, lvlName2] = arguments;
  return lvlName2
    ? d => `${d[lvlName1]} (${joinStringsWithCommaAnd(d[lvlName2])})`
    : d => `${d[lvlName1]}`;
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
