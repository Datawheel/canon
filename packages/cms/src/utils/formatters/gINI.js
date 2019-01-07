const libs = require("./libs");

/**
 * Calculates GINI growth given an array of data and string keys to access the following: bucket, value, weight.
 */
function gINI(n) {
  const {data, bucket, value, weight} = n;
  const sum = libs.d3.sum;
  const newData = [];
  const weightTotal = sum(data, d => d[weight]);
  data.forEach(function(d, i) {
    const bucketName = `${d[bucket]}`
      .replace(/^[\s\<\>\$A-z]*/g, "")
      .replace(/[A-z0-9]+\-/g, "");
    const mod = d[bucket].includes(">") || d[bucket].includes("+")
      || d[bucket].includes("more") || d[bucket].includes("over") || d[bucket].includes("greater")
      ? 1 : 0;
    newData.push({
      data: d,
      bucket: parseFloat(bucketName, 10) + mod,
      total: d[value] * d[weight]
    });
  });
  newData.sort((a, b) => a.bucket - b.bucket);
  const total = sum(newData, d => d.total);
  newData.forEach(function(d, i) {
    d.pctTotal = d.total / total;
    d.pctWeight = d.data[weight] / weightTotal;
  });
  newData.forEach(function(d, i) {
    d.pctBetter = i === newData.length - 1 ? 0 : sum(newData.slice(i + 1), n => n.pctWeight);
    d.score = d.pctTotal * (d.pctWeight + (2 * d.pctBetter));
  });
  return 1 - sum(newData, d => d.score);
}

module.exports = gINI;
