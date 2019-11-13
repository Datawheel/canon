import {formatAbbreviate} from "d3plus-format";
import {ensureArray} from "./arrays";

/**
 * @type {Record<string, (d: number) => string>}
 */
export const DEFAULT_MEASURE_FORMATTERS = {
  default: formatAbbreviate,
  Growth: d => `${formatAbbreviate(d * 100 || 0)}%`,
  Percentage: d => `${formatAbbreviate(d * 1 || 0)}%`,
  Rate: d => `${formatAbbreviate(d * 100 || 0)}%`,
  Ratio: d => `${formatAbbreviate(d * 1 || 0)} to 1`,
  USD: d => `$${formatAbbreviate(d * 1 || 0)}`,
  Year: d => `${d}`,
  get Dollars() {
    return DEFAULT_MEASURE_FORMATTERS.USD;
  },
  "Thousands of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e3),
  "Millions of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e6),
  "Billions of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e9)
};

/**
 * @type {Record<string, number>}
 */
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

/**
 * Composes the full name of a level for presentation.
 * @param {string} [dimension]
 * @param {string} [hierarchy]
 * @param {string} level
 */
export function levelNameFormatter(dimension, hierarchy, level) {
  const name = [level];
  if (hierarchy && !name.includes(hierarchy)) name.unshift(hierarchy);
  if (dimension && !name.includes(dimension)) name.unshift(dimension);
  return name.join(" › ");
}

/**
 * Joins a list of strings to form an enumeration phrase of type "a, b, c, and d".
 * TODO: must be removed because of multilanguage support
 * @param {string[]} list List of strings to join
 * @param {boolean} [oxford] Flag to enable or disable an Oxford comma in the last element.
 */
export function joinStringsWithCommaAnd(list, oxford = true) {
  list = ensureArray(list).filter(Boolean);
  const firstPart = list.slice();
  const lastPart = firstPart.pop();
  const joint = oxford ? ", and " : " and ";
  return firstPart.length > 0
    ? `${firstPart.join(", ")}${joint}${lastPart}`
    : list.join(joint);
}
