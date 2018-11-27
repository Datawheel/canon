import {formatAbbreviate} from "d3plus-format";

export const DEFAULT_MEASURE_FORMATTERS = {
  default: formatAbbreviate,
  Growth: d => `${formatAbbreviate(d * 100 || 0)}%`,
  Percentage: d => `${formatAbbreviate(d * 1 || 0)}%`,
  Rate: d => `${formatAbbreviate(d * 100 || 0)}%`,
  Ratio: d => `${formatAbbreviate(d * 1 || 0)} to 1`,
  USD: d => `$${formatAbbreviate(d * 1 || 0)}`,
  get Dollars() {
    return this.USD;
  },
  "Thousands of Dollars"(d) {
    return this.USD(d * 1e3);
  },
  "Millions of Dollars"(d) {
    return this.USD(d * 1e6);
  },
  "Billions of Dollars"(d) {
    return this.USD(d * 1e9);
  }
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
export function joinStringsWithCommaAnd(list) {
  const copy = list.slice();
  const last = copy.pop();
  return copy.length > 1
    ? `${copy.join(", ")}, and ${last}`
    : list.join(" and ");
}

/**
 * Returns a common title string from a list of parameters.
 * @param {ConfigFunctionFlags} params The common parameters for chartconfig functions.
 * @param {Object<string,any>} flags An object with specific modificators for special cases.
 */
export function composeChartTitle(params, flags) {
  const {levels, timeline} = flags || {};
  const {activeChart, members, query} = params;
  const {level, measure, timeLevel, xlevel} = query;
  let title = `${measure.name} by `;

  const allLevels = levels || [level.name, xlevel && xlevel.name];
  title += joinStringsWithCommaAnd(allLevels.filter(Boolean));

  if (timeLevel) {
    if (!timeline && !activeChart && timeLevel.name in members) {
      title += ` (${params.selectedTime})`;
    }
    else {
      title += `, by ${timeLevel.name}`;
    }
  }

  return `${title}\n${params.subtitle}`;
}
