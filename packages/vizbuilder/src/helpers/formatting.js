import {formatAbbreviate} from "d3plus-format";
import pluralize from "pluralize";

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

const integerBaseline = (config, chart, uiParams) => {
  const {measureName} = chart.names;
  const limitValue = config.yConfig.scale === "log" ? 1 : 0;
  const minValue = chart.dataset.reduce((limit, item) =>
    Math.min(limit, item[measureName])
  );
  if (minValue < limitValue) {
    config.baseline = limitValue;
  }
};

export const DEFAULT_MEASUREUNIT_CONFIG = {
  "SAT Score": (config, chart, uiParams) => {
    const {chartType, names} = chart;
    if (chartType === "lineplot" && config.y === names.measureName) {
      config.yConfig = {
        ...config.yConfig,
        domain: [200, 800]
      };
    }
    else if (chartType === "barchart" && config.x === names.measureName) {
      config.xConfig = {
        ...config.xConfig,
        domain: [200, 800]
      };
    }
  },
  Births: integerBaseline,
  Crimes: integerBaseline,
  Degrees: integerBaseline,
  Establishments: integerBaseline,
  "Hospital Stays": integerBaseline,
  Households: integerBaseline,
  Loans: integerBaseline,
  People: integerBaseline,
  Universities: integerBaseline,
  Visits: integerBaseline,
  Years: integerBaseline
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
 * @param {boolean} [oxford] Flag to enable or disable an Oxford comma in the last element.
 */
export function joinStringsWithCommaAnd(list, oxford = true) {
  list = [].concat(list).filter(Boolean);
  const firstPart = list.slice();
  const lastPart = firstPart.pop();
  const joint = oxford ? ", and " : " and ";
  return firstPart.length > 0
    ? `${firstPart.join(", ")}${joint}${lastPart}`
    : list.join(joint);
}

/**
 * Returns a common title string from a list of parameters.
 */
export function composeChartTitle(chart, uiParams) {
  const {query, setup} = chart;
  const {measureName, timeLevelName} = chart.names;

  const getName = obj => obj.name;
  const levels = setup.map(getName);
  const appliedCuts = query.cuts.map(getName);

  const cuts = [];

  let n = query.groups.length;
  while (n--) {
    const group = query.groups[n];
    const values = group.members.map(m => m.name);

    const levelName = group.level.name;

    let label;
    if (appliedCuts.indexOf(levelName) === -1) {
      // label = `All ${pluralize(levelName, 2)}`;
      continue;
    }
    else if (values.length > 1) {
      label = `the ${values.length} Selected ${pluralize(levelName, values.length)}`;
    }
    else if (values.length === 1) {
      label = values[0];
      const levelIndex = levels.indexOf(levelName);
      if (levelIndex > -1) {
        levels.splice(levelIndex, 1);
      }
    }
    cuts.unshift(label);
  }

  let title = measureName;

  if (levels.length > 0) {
    if (chart.quirk === QUIRKS.TOPTEN) {
      title += ` for top 10 ${joinStringsWithCommaAnd(levels, false)}`;
    }
    else {
      title += ` by ${joinStringsWithCommaAnd(levels, false)}`;
    }
  }

  if (cuts.length > 0) {
    title += `, for ${joinStringsWithCommaAnd(cuts)}`;
  }

  if (timeLevelName) {
    if (!uiParams.activeChart && !uiParams.isTimeline) {
      title += ` (${uiParams.selectedTime})`;
    }
    else {
      title = title
        .replace(measureName, `${measureName} by ${timeLevelName},`)
        .replace(",,", ",");
    }
  }

  return title;
}

if (typeof window !== "undefined") {
  window.composeChartTitle = composeChartTitle;
}
