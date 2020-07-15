import {deviation, mean} from "d3-array";
import groupBy from "lodash/groupBy";
import sumBy from "lodash/sumBy";

/**
 * Calculate the Relative Standard Deviation
 * This means it should have a numeric value, and a valid operator.
 * @param {any[]} data An array to check
 * @param {string} measureName Name of the measure
 */
export function relativeStdDev(data, measureName) {
  const dataPoints = data.map(d => d[measureName]);
  return deviation(dataPoints) / mean(dataPoints);
}

/**
 * @param {any[]} data
 * @param {string} measureName
 */
export function inyectShare(data, measureName) {
  const total = sumBy(data, measureName);
  let n = data.length;
  while (n--) {
    const point = data[n];
    point[`${measureName} Share`] = point[measureName] / total;
  }
  return data;
}

/**
 * @param {any[]} data
 * @param {string} timeLevelName
 * @param {string} measureName
 */
export function inyectShareByTime(data, measureName, timeLevelName) {
  const timedData = groupBy(data, timeLevelName);
  const dataList = Object.values(timedData);

  let n = dataList.length;
  while (n--) {
    const periodData = dataList[n];
    inyectShare(periodData, measureName);
  }
  return data;
}
