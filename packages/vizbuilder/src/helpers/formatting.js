import {formatAbbreviate} from "d3plus-format";

import {QUIRKS} from "./chartCriteria";

export const DEFAULT_MEASURE_FORMATTERS = {
  default: formatAbbreviate,
  Growth: d => `${formatAbbreviate(d * 100 || 0)}%`,
  Percentage: d => `${formatAbbreviate(d * 1 || 0)}%`,
  Rate: d => `${formatAbbreviate(d * 100 || 0)}%`,
  Ratio: d => `${formatAbbreviate(d * 1 || 0)} to 1`,
  USD: d => `$${formatAbbreviate(d * 1 || 0)}`,
  get Dollars() {
    return DEFAULT_MEASURE_FORMATTERS.USD;
  },
  "Thousands of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e3),
  "Millions of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e6),
  "Billions of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e9)
};

export const DEFAULT_MEASURE_MULTIPLIERS = {
  default: 1,
  Growth: 100,
  Rate: 100,
  "Thousands of Dollars": 1e3,
  "Millions of Dollars": 1e6,
  "Billions of Dollars": 1e9
};

export const PROPNAMESTYLES = {
  LVL: 1,
  HIE: 2,
  HIELVL: 3,
  DIM: 4,
  DIMLVL: 5,
  DIMHIE: 6,
  DIMHIELVL: 7
};

/**
 * For a drilldown, generates a standard name format to use in selectors.
 * @param {Level|Measure} item A Level or Measure object
 * @param {number?} style A combination available from the PROPNAMESTYLES enum
 * @returns {string}
 */
export function composePropertyName(item, style = PROPNAMESTYLES.DIMHIELVL) {
  let txt = style & PROPNAMESTYLES.LVL ? item.name : "";
  if ("hierarchy" in item) {
    const hname = item.hierarchy.name;
    const dname = item.hierarchy.dimension.name;
    if (style & PROPNAMESTYLES.HIE && hname !== item.name && hname !== dname) {
      txt = `${hname} › ${txt}`;
    }
    if (style & PROPNAMESTYLES.DIM && dname !== item.name) {
      txt = `${dname} › ${txt}`;
    }
  }
  return txt;
}

/**
 * Returns the first number it finds in a `string`, else returns `elseValue`.
 * @param {string} string The string to test
 * @param {number} elseValue A value to return in case the string doesn't contain any
 */
export function findFirstNumber(string, elseValue) {
  return (`${string}`.match(/[0-9\.\,]+/) || [elseValue])[0] * 1;
}

/**
 * Joins a list of strings to form an enumeration phrase of type "a, b, c, and d".
 * @param {string[]} list List of strings to join
 */
export function joinStringsWithCommaAnd(list, oxford) {
  const copy = list.slice();
  const last = copy.pop();
  return copy.length > 1
    ? `${copy.join(", ")}, and ${last}`
    : list.join(`${oxford ? "," : ""} and `);
}

/**
 * Returns a common title string from a list of parameters.
 */
export function composeChartTitle(chart, uiparams) {
  const {query, setup} = chart;
  const {measureName, timeLevelName} = chart.names;
  const levels = setup.map(lvl => lvl.name);
  const cuts = (query.cuts || []).map(cut => {
    const levelFullName = cut.key;
    const level = setup.find(lvl => lvl.fullName === levelFullName);
    levels.splice(levels.indexOf(level.name), 1);
    const values = cut.values.map(m => m.name);
    return values.length > 1
      ? `for the ${values.length} selected ${level.name}`
      : `for ${values[0]}`;
  });

  let title = measureName;

  if (levels.length > 0) {
    if (chart.quirk === QUIRKS.TOPTEN) {
      title += ` for top 10 ${joinStringsWithCommaAnd(levels)}`;
    }
    else {
      title += ` by ${joinStringsWithCommaAnd(levels)}`;
    }
  }

  if (cuts.length > 0) {
    title += `, ${joinStringsWithCommaAnd(cuts, true)}`;
  }

  if (timeLevelName) {
    const {activeChart, isTimeline, selectedTime} = uiparams;

    if (!activeChart && !isTimeline) {
      title += ` (${selectedTime})`;
    }
    else {
      title += `, by ${timeLevelName}`;
    }
  }

  return title;
}
