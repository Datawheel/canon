import minBy from "lodash/minBy";

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
 * LEGACY FUNCTION
 * This function was related to the measure baseline config
 * TODO: discuss
 * @param {Partial<import("../types/d3plus").D3plusConfig>} config
 * @param {Chart} chart
 */
export function integerBaseline(config, chart) {
  const measureName = chart.params.measure.name;
  const limitValue = config.yConfig?.scale === "log" ? 1 : 0;
  const minValue = minBy(chart.data, measureName);
  if (minValue < limitValue) {
    config.baseline = limitValue;
  }
}
