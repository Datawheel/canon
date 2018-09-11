/**
 * Calculate the average of a data array
 * This means it should have a numeric value, and a valid operator.
 * @param {Array} data An array to check
 * @param {String} measureName Name of the measure
 */
export function average(data, measureName) {
  const len = data.length, 
        sum = data.reduce((sum, d) => sum + d[measureName], 0);
  
  return sum / len;
}

/**
 * Calculate the Relative Standard Deviation
 * This means it should have a numeric value, and a valid operator.
 * @param {Array} data An array to check
 * @param {String} measureName Name of the measure
 */
export function relativeStdDev(data, measureName) {
  return standardDeviation(data, measureName) / average(data, measureName);
}


/**
 * Calculate the standard deviation of a data array
 * This means it should have a numeric value, and a valid operator.
 * @param {Array} data An array to check
 * @param {String} measureName Name of the measure
 */
export function standardDeviation(data, measureName) {
  const len = data.length, 
        sum = data.reduce((sum, d) => sum + d[measureName], 0);
  
  const avg = sum / len;
  const diffs = data.reduce((sum, d) => sum + Math.pow(d[measureName] - avg, 2), 0);

  return Math.sqrt(diffs / (len - 1));
}
