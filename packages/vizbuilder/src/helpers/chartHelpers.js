import {BarChart, Donut, Geomap, LinePlot, Pie, StackedArea, Treemap} from "d3plus-react";
import {areMetaMeasuresZero, isValidFilter} from "./validation";

export const chartComponents = {
  barchart: BarChart,
  barchartyear: BarChart,
  donut: Donut,
  geomap: Geomap,
  histogram: BarChart,
  lineplot: LinePlot,
  pie: Pie,
  stacked: StackedArea,
  treemap: Treemap
};

/**
 * Generates the parameters for the tooltip shown for the current datagroup.
 * @param {Chart} chart
 * @param {object} params
 * @param {Record<string, (d: number) => string>} params.formatters
 * @param {import("i18next").TFunction} params.t
 */
export function tooltipGenerator(chart, {formatters, t}) {
  const {filters, measure, levels, collection, source, moe, uci, lci} = chart.params;

  const measureName = measure.name;
  const levelName = levels[0].name;

  const collectionName = collection ? collection.name : "";
  const lciName = lci ? lci.name : "";
  const moeName = moe ? moe.name : "";
  const sourceName = source ? source.name : "";
  const uciName = uci ? uci.name : "";

  const formatter = formatters[measureName] || formatters.default;

  const shouldShow = areMetaMeasuresZero(chart.data, {
    collectionName,
    lciName,
    moeName,
    sourceName,
    uciName
  });

  const tbody = Object.keys(chart.members)
    .filter(lvl => lvl !== levelName)
    .map(lvl => [lvl, d => d[lvl]]);
  tbody.push([measureName, d => formatter(d[measureName])]);

  if (measure.aggregationType === "SUM") {
    const percentFormatter = formatters.Rate;
    tbody.push([
      t("Vizbuilder.chart_labels.measure_share", {measureName}),
      d => percentFormatter(d[`${measureName} Share`])
    ]);
  }

  if (shouldShow.lci && shouldShow.uci) {
    tbody.push([
      t("Vizbuilder.chart_labels.ci"),
      d => `${formatter(d[lciName] * 1 || 0)} - ${formatter(d[uciName] * 1 || 0)}`
    ]);
  }
  else if (shouldShow.moe) {
    tbody.push([
      t("Vizbuilder.chart_labels.moe"),
      d => `± ${formatter(d[moeName] * 1 || 0)}`
    ]);
  }

  if (shouldShow.src) {
    tbody.push([t("Vizbuilder.chart_labels.source"), d => `${d[sourceName]}`]);
  }

  if (shouldShow.clt) {
    tbody.push([t("Vizbuilder.chart_labels.collection"), d => `${d[collectionName]}`]);
  }

  if (Array.isArray(filters)) {
    filters.forEach(filter => {
      if (isValidFilter(filter)) {
        const filterName = filter.measure;
        const formatter = formatters[filterName] || formatters.default;
        tbody.push([filterName, d => `${formatter(d[filterName])}`]);
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
 * @param {...string} args
 */
export function labelFunctionGenerator(...args) {
  const [lvlName1, ...lvlName2] = args;
  return Array.isArray(lvlName2) && lvlName2.length > 0
    ? d => `${d[lvlName1]} (${lvlName2.map(k => d[k]).join(", ")})`
    : d => `${d[lvlName1]}`;
}

/**
 * Returns a common title string from a list of parameters.
 * @param {Chart} chart
 * @param {any} uiParams
 */
// export function chartTitleGenerator(chart, uiParams) {
//   const {query, setup} = chart;
//   const {measureName, timeLevelName} = chart.names;

//   const getName = obj => obj.name;
//   const levels = setup.map(getName);
//   const appliedCuts = query.cuts.map(getName);

//   const cuts = [];

//   let n = query.groups.length;
//   while (n--) {
//     const group = query.groups[n];
//     const values = group.members.map(m => m.name);

//     const levelName = group.level.name;

//     let label;
//     if (appliedCuts.indexOf(levelName) === -1) {
//       // label = `All ${pluralize(levelName, 2)}`;
//       continue;
//     }
//     else if (values.length > 1) {
//       label = `the ${values.length} Selected ${pluralize(levelName, values.length)}`;
//     }
//     else if (values.length === 1) {
//       label = values[0];
//       const levelIndex = levels.indexOf(levelName);
//       if (levelIndex > -1) {
//         levels.splice(levelIndex, 1);
//       }
//     }
//     cuts.unshift(label);
//   }

//   let title = measureName;

//   if (levels.length > 0) {
//     if (chart.isTopTen) {
//       title += ` for top 10 ${joinStringsWithCommaAnd(levels, false)}`;
//     }
//     else {
//       title += ` by ${joinStringsWithCommaAnd(levels, false)}`;
//     }
//   }

//   if (cuts.length > 0) {
//     title += `, for ${joinStringsWithCommaAnd(cuts)}`;
//   }

//   if (timeLevelName) {
//     if (!uiParams.activeChart && !uiParams.isTimeline) {
//       title += ` (${uiParams.selectedTime})`;
//     }
//     else {
//       title = title
//         .replace(measureName, `${measureName} by ${timeLevelName},`)
//         .replace(",,", ",");
//     }
//   }

//   return title;
// }
