/* eslint-disable new-cap */
import {integerBaseline} from "./format";
import {formatAbbreviate} from "d3plus-format";

/**
 * Internal keys for Filter comparison operators
 * @type {Record<string, string>}
 */
export const Comparison = {
  EQ: "=",
  GT: ">",
  GTE: ">=",
  LT: "<",
  LTE: "<=",
  NEQ: "!="
};

/**
 * Default formatters for measure values
 * @type {Record<string, (d: number) => string>}
 */
export const DEFAULT_MEASURE_FORMATTERS = {
  "default": formatAbbreviate,
  "identity": d => `${d}`,
  "Growth": d => `${formatAbbreviate(d * 100 || 0)}%`,
  "Percentage": d => `${formatAbbreviate(d * 1 || 0)}%`,
  "Rate": d => `${formatAbbreviate(d * 100 || 0)}%`,
  "Ratio": d => `${formatAbbreviate(d * 1 || 0)} to 1`,
  "USD": d => `$${formatAbbreviate(d * 1 || 0)}`,
  "Year": d => `${d}`,
  get "Dollars"() {
    return DEFAULT_MEASURE_FORMATTERS.USD;
  },
  "Thousands of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e3),
  "Millions of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e6),
  "Billions of Dollars": d => DEFAULT_MEASURE_FORMATTERS.USD(d * 1e9)
};

/**
 * Default multipliers for measure values
 * Useful to interpret and convert values when measures change in a filter.
 * @type {Record<string, number>}
 */
export const DEFAULT_MEASURE_MULTIPLIERS = {
  "default": 1,
  "Growth": 100,
  "Rate": 100,
  "Thousands of Dollars": 1e3,
  "Millions of Dollars": 1e6,
  "Billions of Dollars": 1e9
};

/**
 * Default config for specific measures
 * @type {Record<string, (config: import("../types/d3plus").D3plusConfig, chart: Chart) => void>}
 */
export const DEFAULT_MEASUREUNIT_CONFIG = {
  "SAT Score": (config, chart) => {
    const {chartType} = chart;
    const measureName = chart.params.measure.name;
    if (chartType === "lineplot" && config.y === measureName) {
      config.yConfig = {
        ...config.yConfig,
        domain: [200, 800]
      };
    }
    else if (chartType === "barchart" && config.x === measureName) {
      config.xConfig = {
        ...config.xConfig,
        domain: [200, 800]
      };
    }
  },
  "Births": integerBaseline,
  "Crimes": integerBaseline,
  "Degrees": integerBaseline,
  "Establishments": integerBaseline,
  "Hospital Stays": integerBaseline,
  "Households": integerBaseline,
  "Loans": integerBaseline,
  "People": integerBaseline,
  "Universities": integerBaseline,
  "Visits": integerBaseline,
  "Years": integerBaseline
};
