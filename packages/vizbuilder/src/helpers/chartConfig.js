import {assign} from "d3plus-common";
import {labelFunctionGenerator, tooltipGenerator} from "./chartHelpers";
import {findParentHierarchy} from "./find";
import {relativeStdDev} from "./math";
import {sortByCustomKey} from "./sort";

/**
 * @typedef UIParams
 * @property {string?} activeChart
 * @property {Record<string, (d: number) => string>} formatters
 * @property {boolean} isSingleChart
 * @property {boolean} isUniqueChart
 * @property {string} locale
 * @property {Partial<import("../types/d3plus").D3plusConfig>} measureConfig
 * @property {(period: Date) => any} onTimeChange
 * @property {boolean} showConfidenceInt
 * @property {import("i18next").TFunction} t
 * @property {number | undefined} timePeriod
 * @property {Partial<import("../types/d3plus").D3plusConfig>} topojsonConfig
 * @property {Partial<import("../types/d3plus").D3plusConfig>} userConfig
 */

/**
 * Generates an array with valid config objects, depending on the type of data
 * retrieved and the current user defined parameters, to use in d3plus charts.
 * @param {Chart} chart
 * @param {UIParams} uiParams
 */
export default function createChartConfig(chart, uiParams) {
  const {chartType} = chart;
  const {measure, levels, timeLevel} = chart.params;
  const {isSingleChart, isUniqueChart, formatters} = uiParams;

  const levelNames = levels.map(lvl => lvl.caption);
  const measureName = measure.name;
  const getMeasureValue = d => d[measureName];

  const formatter = formatters[measureName] || formatters.default;
  const isEnlarged = uiParams.activeChart === chart.key || isUniqueChart;

  const config = assign(
    {
      legend: false,
      duration: 0,

      total: false,
      totalFormat: d => `Total: ${formatter(d)}`,

      xConfig: {
        duration: 0,
        title: null
      },
      yConfig: {
        duration: 0,
        title: measureName,
        tickFormat: formatter
      },
      label: labelFunctionGenerator(...levelNames),
      locale: uiParams.locale,

      shapeConfig: {
        duration: 0
      },

      sum: getMeasureValue,
      value: getMeasureValue
    },
    makeConfig[chartType](chart, uiParams)
  );

  if (
    ["Percentage", "Rate"].indexOf(measure.unit) === -1 &&
    ["SUM", "UNKNOWN"].indexOf(measure.aggregationType) > -1
  ) {
    config.total = getMeasureValue;
  }

  if (timeLevel && config.time) {
    const timeLevelName = timeLevel.caption;
    const timePeriod = uiParams.timePeriod;

    config.timeFilter = d => d[timeLevelName] == timePeriod; // eslint-disable-line
    config.timeline = isEnlarged;
    config.timelineConfig = {
      on: {end: uiParams.onTimeChange}
    };
  }

  config.data = chart.data;
  config.tooltipConfig = tooltipGenerator(chart, uiParams);
  config.zoom = chartType === "geomap" && isSingleChart;

  // if (config.title === undefined) {
  //   config.title = chartTitleGenerator(chart, {
  //     activeChart,
  //     selectedTime,
  //     isTimeline: isTimeline || config.timeline
  //   });
  // }

  return config;
}

const makeConfig = {
  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  barchart(chart, {formatters, userConfig}) {
    const {timeLevel, levels, measure, cube} = chart.params;
    const level = levels[0];

    const levelName = level.caption;
    const measureName = measure.name;

    const config = assign(
      {
        discrete: "y",
        x: measureName,
        xConfig: {
          title: measureName,
          tickFormat: formatters[measureName] || formatters.default
        },
        y: levelName,
        yConfig: {
          title: levelName,
          ticks: []
        },
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
      userConfig
    );

    if (timeLevel) {
      const parentHie = findParentHierarchy(cube, timeLevel);
      config.groupBy = [parentHie.levels[0].name];
      config.time = timeLevel.caption;
    }
    else if (levels.length > 1) {
      config.groupBy = levels.slice(1).map(lvl => lvl.caption);
    }

    if (!config.time) {
      delete config.total;
    }

    return config;
  },

  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  barchartyear(chart, {formatters, userConfig}) {
    const {timeLevel, levels, measure} = chart.params;
    const level = levels[0];

    const levelName = level.caption;
    const measureName = measure.name;
    const timeLevelName = timeLevel ? timeLevel.caption : levels[0].caption;

    const config = assign(
      {
        discrete: "x",
        x: timeLevelName,
        xConfig: {
          title: timeLevelName
        },
        y: measureName,
        yConfig: {
          title: measureName,
          tickFormat: formatters[measureName] || formatters.default
        },
        stacked: true,
        groupBy: [levelName]
      },
      userConfig
    );

    delete config.time;
    delete config.total;

    return config;
  },

  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  donut(chart, uiParams) {
    const {timeLevel, levels, measure} = chart.params;

    const config = assign(
      {
        y: measure.name,
        groupBy: levels.map(lvl => lvl.caption)
      },
      uiParams.userConfig
    );

    if (timeLevel) {
      config.time = timeLevel.caption;
    }

    return config;
  },

  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  geomap(chart, {formatters, topojsonConfig, userConfig}) {
    const {timeLevel, geoLevel, levels, cuts, measure} = chart.params;

    const measureName = measure.name;
    const geoLevelName = geoLevel ? geoLevel.caption : levels[0].caption;

    const groupByParam =
      `ID ${geoLevelName}` in chart.data[0] ? `ID ${geoLevelName}` : `${geoLevelName} ID`;
    const config = assign(
      {
        colorScale: measureName,
        colorScaleConfig: {
          axisConfig: {
            tickFormat: formatters[measureName] || formatters.default
          },
          scale: "jenks"
        },
        colorScalePosition: "right",
        groupBy: [groupByParam],
        zoomScroll: false
      },
      topojsonConfig,
      userConfig
    );

    const geoCutMembers = cuts[geoLevelName];
    if (geoCutMembers && !config.fitFilter) {
      config.fitFilter = d => geoCutMembers.indexOf(d.id) > -1;
    }

    if (timeLevel) {
      config.time = timeLevel.caption;
    }

    return config;
  },

  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  histogram(chart, uiParams) {
    const config = makeConfig.barchart(chart, uiParams);
    config.groupPadding = 0;
    return config;
  },

  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  lineplot(chart, {formatters, userConfig, showConfidenceInt}) {
    const {timeLevel, levels, measure} = chart.params;

    const levelName = levels[0].caption;
    const measureName = measure.name;
    const timeLevelName = timeLevel ? timeLevel.caption : levelName;

    const config = assign(
      {
        confidence: false,
        discrete: "x",
        groupBy: levels.map(lvl => lvl.caption),
        x: timeLevelName,
        xConfig: {title: timeLevelName},
        y: measureName,
        yConfig: {
          scale: "linear",
          title: measureName,
          tickFormat: formatters[measureName] || formatters.default
        }
      },
      userConfig
    );

    if (relativeStdDev(chart.data, measureName) > 1) {
      config.yConfig.scale = "log";
      config.yConfig.title += " (Log)";
    }

    if (showConfidenceInt && chart.members[levelName].length < 13) {
      const {moe, lci, uci} = chart.params;
      if (lci && uci) {
        const lciName = lci.name;
        const uciName = uci.name;
        config.confidence = [d => d[lciName], d => d[uciName]];
      }
      else if (moe) {
        const moeName = moe.name;
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

  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  pie(chart, uiParams) {
    return this.donut(chart, uiParams);
  },

  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  stacked(chart, uiParams) {
    const {measure, levels} = chart.params;

    const config = makeConfig.lineplot(chart, uiParams);
    config.yConfig = {scale: "linear", title: measure.name};

    if (levels.length > 1) {
      config.groupBy = levels.map(lvl => lvl.caption);
    }

    return config;
  },

  /**
   * @param {Chart} chart
   * @param {UIParams} uiParams
   * @returns {Partial<import("../types/d3plus").D3plusConfig>}
   */
  treemap(chart, uiParams) {
    const {cube, levels, timeLevel} = chart.params;

    const level = levels[0];
    const otherLevels = levels.slice(1);

    const parentHie = findParentHierarchy(cube, level);
    const hieLevels = parentHie.levels;
    const ddIndex = hieLevels.indexOf(level);

    const config = assign(
      {
        groupBy: hieLevels
          .slice(0, ddIndex + 1)
          .concat(otherLevels)
          .map(lvl => lvl.caption)
      },
      uiParams.userConfig
    );

    if (timeLevel) {
      config.time = timeLevel.caption;
    }

    return config;
  }
};
