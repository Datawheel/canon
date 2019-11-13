import {isValidGroup} from "./validation";

export function chartCollision(charts) {
  const chartKeys = {};
  const filteredCharts = [];

  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];

    const groups = new Map();
    const totalGroups = chart.query.groups.length;
    for (let j = 0; j < totalGroups; j++) {
      const group = chart.query.groups[j];
      if (isValidGroup(group)) {
        groups.set(group.key, group);
      }
    }

    const keyComponents = [];

    let elements = chart.setup;
    for (let j = 0; j < elements.length; j++) {
      const level = elements[j];
      const grouping = groups.get(level.annotations._key);
      keyComponents.push(grouping.toString());
    }

    elements = chart.query.cuts;
    for (let j = 0; j < elements.length; j++) {
      const grouping = elements[j];
      const key = grouping.toString();
      if (keyComponents.indexOf(key) === -1) {
        keyComponents.push(key);
      }
    }

    const chartKey = `${chart.chartType}-${keyComponents.join("-")}`;

    if (!chartKeys[chartKey]) {
      chart.key = `${chart.query.kind}-${chartKey}`;
      chartKeys[chartKey] = true;
      filteredCharts.push(chart);
    }
  }

  return filteredCharts;
}
