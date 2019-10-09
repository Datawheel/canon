import {formatAbbreviate} from "d3plus-format";

/**
 * @type {{[Format: string]: (d: number) => string}}
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
 * @type {{[Format: string]: number}}
 */
export const DEFAULT_MEASURE_MULTIPLIERS = {
  default: 1,
  Growth: 100,
  Rate: 100,
  "Thousands of Dollars": 1e3,
  "Millions of Dollars": 1e6,
  "Billions of Dollars": 1e9
};

/**
 * Composes the full name of a level for presentation.
 * @param {string} dimension
 * @param {string} hierarchy
 * @param {string} level
 */
export function levelNameFormatter(dimension, hierarchy, level) {
  const name = [level];
  if (!name.includes(hierarchy)) name.unshift(hierarchy);
  if (!name.includes(dimension)) name.unshift(dimension);
  return name.join(" › ");
}
