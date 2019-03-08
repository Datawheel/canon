import {assign} from "d3plus-common";

import {composeChartTitle} from "./formatting";
import {relativeStdDev} from "./math";
import {sortByCustomKey} from "./sorting";

const makeConfig = {
  barchart(chart, uiParams) {
    const {timeLevel, level} = chart.query;
    const {levelName, measureName, timeLevelName} = chart.names;

    const config = assign(
      {},
      chart.baseConfig,
      {
        discrete: "y",
        y: levelName,
        yConfig: {title: levelName, ticks: []},
        x: measureName,
        stacked: level.depth > 1,
        shapeConfig: {
          Bar: {
            labelConfig: {
              textAnchor: "start"
            }
          }
        },
        ySort: sortByCustomKey(levelName, chart.members[levelName])
      },
      chart.userConfig
    );

    if (timeLevel) {
      config.time = timeLevelName;
      config.groupBy = [timeLevel.hierarchy.levels[1].name];
    }

    if (!config.time) {
      delete config.total;
    }

    if (chart.setup.length > 1) {
      config.groupBy = [chart.setup[1].name];
    }

    return config;
  },
  barchartyear(chart, uiParams) {
    const {levelName, timeLevelName, measureName} = chart.names;

    const config = assign(
      {},
      chart.baseConfig,
      {
        discrete: "x",
        x: timeLevelName,
        xConfig: {title: timeLevelName},
        y: measureName,
        stacked: true,
        groupBy: [levelName]
      },
      chart.userConfig
    );

    delete config.time;
    delete config.total;

    return config;
  },
  donut(chart, uiParams) {
    const {levelName, measureName, timeLevelName} = chart.names;

    const config = assign(
      {},
      chart.baseConfig,
      {
        y: measureName,
        groupBy: [levelName]
      },
      chart.userConfig
    );

    if (chart.setup.length > 1) {
      config.groupBy = chart.setup.map(lvl => lvl.name);
    }

    if (timeLevelName) {
      config.time = timeLevelName;
    }

    return config;
  },
  geomap(chart, uiParams) {
    const {names, query} = chart;
    const {levelName, measureName, timeLevelName} = names;

    const config = assign(
      {},
      chart.baseConfig,
      {
        colorScale: measureName,
        colorScaleConfig: {
          axisConfig: {tickFormat: chart.formatter},
          scale: "jenks"
        },
        colorScalePosition: "right",
        groupBy: [`ID ${levelName}`],
        zoomScroll: false
      },
      chart.topoConfig,
      chart.userConfig
    );

    const levelCut =
      query.cuts && query.cuts.find(cut => cut.key.indexOf(`[${levelName}]`) > -1);
    if (levelCut && !config.fitFilter) {
      const levelCutMembers = levelCut.values.map(member => member.key);
      config.fitFilter = d => levelCutMembers.indexOf(d.id) > -1;
    }

    if (timeLevelName) {
      config.time = timeLevelName;
    }

    return config;
  },
  histogram(chart, uiParams) {
    const config = this.barchart(chart, uiParams);

    return assign(
      config,
      {
        groupPadding: 0
      },
      chart.userConfig
    );
  },
  lineplot(chart, uiParams) {
    const {levelNames, measureName, timeLevelName} = chart.names;

    const config = assign(
      {},
      chart.baseConfig,
      {
        discrete: "x",
        confidence: [],
        groupBy: chart.setup.map(lvl => lvl.name),
        yConfig: {scale: "linear", title: measureName},
        x: timeLevelName,
        xConfig: {title: timeLevelName},
        y: measureName
      },
      chart.userConfig
    );

    if (relativeStdDev(chart.dataset, measureName) > 1) {
      config.yConfig.scale = "log";
      config.yConfig.title += " (Log)";
    }

    const mainLevelName = levelNames[0];
    if (chart.members[mainLevelName].length < 13) {
      const {moeName, lciName, uciName} = chart.names;
      if (lciName && uciName) {
        config.confidence = [d => d[lciName], d => d[uciName]];
      }
      else if (moeName) {
        config.confidence = [
          d => d[measureName] - d[moeName],
          d => d[measureName] + d[moeName]
        ];
      }
    }

    delete config.time;
    delete config.total;

    return config;
  },
  pie(chart, uiParams) {
    return this.donut(chart, uiParams);
  },
  stacked(chart, uiParams) {
    const {measureName} = chart.names;

    const config = this.lineplot(chart, uiParams);
    config.yConfig = {scale: "linear", title: measureName};

    if (chart.setup.length > 1) {
      config.groupBy = chart.setup.map(lvl => lvl.name);
    }

    return config;
  },
  treemap(chart, uiParams) {
    const {timeLevelName} = chart.names;
    const setup = chart.setup.slice();

    const level = setup.shift();
    const levels = level.hierarchy.levels;
    const ddIndex = levels.indexOf(level);

    const config = assign(
      {},
      chart.baseConfig,
      {
        groupBy: levels.slice(1, ddIndex + 1).map(lvl => lvl.name)
      },
      chart.userConfig
    );

    if (setup.length > 0) {
      const additionalLevels = setup.map(lvl => lvl.name);
      config.groupBy.push(...additionalLevels);
    }

    if (timeLevelName) {
      config.time = timeLevelName;
    }

    return config;
  }
};

/**
 * Generates an array with valid config objects, depending on the type of data
 * retrieved and the current user defined parameters, to use in d3plus charts.
 */
export default function createChartConfig(chart, uiParams) {
  const {chartType, names} = chart;
  const {measureName, timeLevelName} = names;
  const {activeChart, isSingle, isUnique, selectedTime, onTimeChange} = uiParams;

  const isEnlarged = chart.key === activeChart || isUnique;

  const config = makeConfig[chartType](chart, uiParams);

  config.data = chart.dataset;

  if (chart.aggType === "SUM" || chart.aggType === "UNKNOWN") {
    config.total = measureName;
  }

  if (config.time) {
    config.timeFilter = d => d[timeLevelName] == selectedTime; // eslint-disable-line
    config.timeline = isEnlarged;
    config.timelineConfig = {
      on: {end: onTimeChange}
    };
  }

  const isTimeline = config.x === timeLevelName;

  if (isTimeline) {
    delete config.total;
  }

  config.zoom = chartType === "geomap" && isSingle;

  if (config.title === undefined) {
    config.title = composeChartTitle(chart, {
      activeChart,
      selectedTime,
      isTimeline: isTimeline || config.timeline
    });
  }

  return config;
}
