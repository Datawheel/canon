import {
  BarChart,
  Donut,
  Geomap,
  LinePlot,
  Pie,
  StackedArea,
  Treemap
} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {relativeStdDev} from "./math";
import {sortByCustomKey} from "./sorting";

export const charts = {
  barchart: BarChart,
  barchartx: BarChart,
  barchartyear: BarChart,
  donut: Donut,
  geomap: Geomap,
  lineplot: LinePlot,
  lineplotx: LinePlot,
  pie: Pie,
  stacked: StackedArea,
  stackedx: StackedArea,
  treemap: Treemap,
  treemapx: Treemap
};

export const ALL_YEARS = "All years";

export const tooltipGenerator = (query, levels, measureFormatter) => {
  const {
    levelName,
    measureName,
    moeName,
    lciName,
    uciName,
    sourceName,
    collectionName
  } = query;
  const tbody = levels.filter(d => d !== levelName).map(dd => [dd, d => d[dd]]);
  tbody.push([measureName, d => measureFormatter(d[measureName])]);

  if (lciName && uciName) {
    tbody.push([
      "Confidence Interval",
      d =>
        `[${measureFormatter(d[lciName] * 1 || 0)}, ${measureFormatter(
          d[uciName] * 1 || 0
        )}]`
    ]);
  }
  else if (moeName) {
    tbody.push([
      "Margin of Error",
      d => `± ${measureFormatter(d[moeName] * 1 || 0)}`
    ]);
  }

  if (sourceName) {
    tbody.push(["Source", d => `${d[sourceName]}`]);
  }

  if (collectionName) {
    tbody.push(["Collection", d => `${d[collectionName]}`]);
  }

  return {
    title: d => [].concat(d[levelName]).join(", "),
    tbody
  };
};

/**
 * @prop {[x: string]: ChartConfigFunction}
 */
const makeConfig = {
  barchart(commonConfig, query, flags) {
    const {timeLevel, level, measure} = query;

    const levelName = level.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      discrete: "y",
      label: d => d[levelName],
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
      ySort: sortByCustomKey(levelName),
      ...flags.chartConfig
    };

    if (timeLevel) {
      config.groupBy = [timeLevel.hierarchy.levels[1].name];
    }

    return config;
  },
  barchartx(commonConfig, query, flags) {
    const config = this.barchart(commonConfig, query, flags);
    // config.y = query.level.name;
    config.groupBy = [query.xlevel.name];
    return config;
  },
  barchartyear(commonConfig, query, flags) {
    const {level, timeLevel, measure} = query;

    const levelName = timeLevel.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      title: `${measureName} by ${levelName}`,
      discrete: "x",
      x: levelName,
      xConfig: {title: levelName},
      y: measureName,
      stacked: true,
      groupBy: [level.name],
      ...flags.chartConfig
    };

    delete config.time;

    return config;
  },
  barchartyearx(commonConfig, query, flags) {
    const config = this.barchartyear(commonConfig, query, flags);
    // config.groupBy = [query.level.name, query.xlevel.name];
    return config;
  },
  donut(commonConfig, query, flags) {
    const {level, measure} = query;

    const levelName = level.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      y: measureName,
      groupBy: [levelName],
      ...flags.chartConfig
    };

    return config;
  },
  donutx(commonConfig, query, flags) {
    const config = this.donut(commonConfig, query, flags);
    config.groupBy = [query.level.name, query.xlevel.name];
    return config;
  },
  geomap(commonConfig, query, flags) {
    const levelName = query.level.name;
    const measureName = query.measure.name;

    const config = {
      ...commonConfig,
      colorScale: measureName,
      colorScaleConfig: {scale: "jenks"},
      colorScalePosition: "right",
      groupBy: [`ID ${levelName}`],
      zoomScroll: false,
      ...flags.topojsonConfig,
      ...flags.chartConfig
    };

    if (!flags.activeType) {
      config.zoom = false;
    }

    return config;
  },
  geomapx(commonConfig, query, flags) {
    const level1Name = query.level.name;
    const level2Name = query.xlevel.name;
    const config = this.geomap(commonConfig, query, flags);
    config.groupBy = [level1Name, level2Name];
    return config;
  },
  histogram(commonConfig, query, flags) {
    const config = this.barchart(commonConfig, query, flags);

    return {
      ...config,
      groupPadding: 0,
      ...flags.chartConfig
    };
  },
  lineplot(commonConfig, query, flags) {
    const {level, measure, moe, lci, uci, timeLevel} = query;

    const levelName = timeLevel.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      title: `${measureName} by ${levelName}`,
      discrete: "x",
      groupBy: level.name,
      yConfig: {scale: "linear", title: measureName},
      x: levelName,
      xConfig: {title: levelName},
      y: measureName,
      ...flags.chartConfig
    };

    if (query.member) {
      config.title += ` (${query.member.name})`;
    }

    if (relativeStdDev(flags.dataset, measureName) > 1) {
      config.yConfig.scale = "log";
      config.yConfig.title += " (Log)";
    }

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

    delete config.time;

    return config;
  },
  lineplotx(commonConfig, query, flags) {
    const config = this.lineplot(commonConfig, query, flags);
    config.groupBy = [query.level.name, query.xlevel.name];
    return config;
  },
  pie(commonConfig, query, flags) {
    return this.donut(commonConfig, query, flags);
  },
  piex(commonConfig, query, flags) {
    const config = this.pie(commonConfig, query, flags);
    config.groupBy = [query.level.name, query.xlevel.name];
    return config;
  },
  stacked(commonConfig, query, flags) {
    const config = this.lineplot(commonConfig, query, flags);

    const levelName = query.level.name;
    const measureName = query.measure.name;

    config.title = `${measureName} by ${levelName}`;
    if (query.member) {
      config.title += ` (${query.member.name})`;
    }

    config.yConfig = {scale: "linear", title: measureName};

    return config;
  },
  stackedx(commonConfig, query, flags) {
    const config = this.stacked(commonConfig, query, flags);
    config.groupBy = [query.level.name, query.xlevel.name];
    return config;
  },
  treemap(commonConfig, query, flags) {
    const {level} = query;

    const levels = level.hierarchy.levels;
    const ddIndex = levels.indexOf(level);

    const config = {
      ...commonConfig,
      groupBy: levels.slice(1, ddIndex + 1).map(lvl => lvl.name),
      ...flags.chartConfig
    };

    return config;
  },
  treemapx(commonConfig, query, flags) {
    const config = this.treemap(commonConfig, query, flags);
    config.groupBy.push(query.xlevel.name);
    return config;
  },
};

/**
 * Generates an array with valid config objects, depending on the type of data
 * retrieved and the current user defined parameters, to use in d3plus charts.
 * @param {Object} query The current query object from the Vizbuilder's state
 * @param {Object[]} dataset The dataset for the current query
 * @param {Object<string,string[]>} members An object with the members in the current dataset
 * @param {string} activeType The currently active chart type
 * @param {UserDefinedChartConfig} param0 The object containing the parameters
 * @returns {CreateChartConfigResult[]}
 */
export default function createChartConfig(
  query,
  dataset,
  members,
  activeType,
  {defaultConfig, formatting, measureConfig, topojson, visualizations}
) {
  const queryKey = query.key;

  if (!dataset.length) {
    return [];
  }

  // this prevents execution when the activeChart isn't for this query
  if (activeType) {
    let activeKey = activeType.split("_");
    activeType = activeKey.pop();
    activeKey = activeKey.join("_");

    if (activeKey !== queryKey) {
      return [];
    }
  }

  const availableKeys = Object.keys(members);
  const availableCharts = new Set(activeType ? [activeType] : visualizations);

  const measure = query.measure;
  const measureName = measure.name;
  const measureUnits = measure.annotations.units_of_measurement;
  const measureFormatter = formatting[measureUnits] || formatAbbreviate;
  const getMeasureValue = d => d[measureName];

  const levelName = query.level.name;
  const timeLevelName = query.timeLevel && query.timeLevel.name;
  const dimension = query.level.hierarchy.dimension;

  const hasTimeDim = timeLevelName && Array.isArray(members[timeLevelName]);
  const hasGeoDim = dimension.annotations.dim_type === "GEOGRAPHY";

  const aggregatorType =
    measure.annotations.aggregation_method ||
    measure.aggregatorType ||
    "UNKNOWN";

  const commonConfig = {
    title: `${measureName} by ${levelName}`,
    data: dataset,
    height: activeType ? 500 : 400,
    legend: false,

    tooltipConfig: tooltipGenerator(
      {
        levelName,
        measureName,
        moeName: query.moe && query.moe.name,
        lciName: query.lci && query.lci.name,
        uciName: query.uci && query.uci.name,
        sourceName: query.source && query.source.name,
        collectionName: query.collection && query.collection.name
      },
      availableKeys,
      measureFormatter
    ),

    xConfig: {title: null},
    yConfig: {
      title: measureName,
      tickFormat: measureFormatter
    },

    duration: 0,
    sum: getMeasureValue,
    value: getMeasureValue
  };

  if (hasTimeDim) {
    commonConfig.time = timeLevelName;
  }

  if (aggregatorType === "SUM" || aggregatorType === "UNKNOWN") {
    commonConfig.total = getMeasureValue;
  }

  const topojsonConfig = topojson[levelName];

  if (!activeType) {
    if (members[levelName].length > 20) {
      availableCharts.delete("barchart");
    }

    if (!hasTimeDim || members[timeLevelName].length === 1) {
      availableCharts.delete("stacked");
      availableCharts.delete("barchartyear");
      availableCharts.delete("lineplot");
    }

    if (!hasGeoDim || !topojsonConfig || members[levelName].length === 1) {
      availableCharts.delete("geomap");
    }

    if (aggregatorType === "AVERAGE") {
      availableCharts.delete("donut");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
      availableCharts.delete("histogram");
    }
    if (aggregatorType !== "UNKNOWN" && aggregatorType !== "SUM") {
      availableCharts.delete("treemap");
      availableCharts.delete("barchartyear");
    }

    if (availableKeys.some(d => d !== "Year" && members[d].length === 1)) {
      availableCharts.delete("treemap");
      availableCharts.delete("barchart");
      availableCharts.delete("barchartyear");
      availableCharts.delete("stacked");
    }
  }

  const currentMeasureConfig = measureConfig[measureName] || {};

  const flags = {
    activeType,
    aggregatorType,
    availableKeys,
    dataset,
    measureFormatter,
    topojsonConfig,
    chartConfig: {
      ...defaultConfig,
      ...currentMeasureConfig
    }
  };

  const isCrossLevel = Boolean(query.xlevel);

  return Array.from(
    availableCharts,
    chartType => {
      const functionName = chartType + (isCrossLevel ? 'x' : '');
      return charts.hasOwnProperty(functionName) && {
        key: `${queryKey}_${chartType}`,
        component: charts[chartType],
        config: makeConfig[functionName](commonConfig, query, flags)
      }
    }
  ).filter(Boolean);
}

/**
 * @typedef {(commonConfig, query, flags) => object} ChartConfigFunction
 * @param {object} commonConfig The common config between all charts
 * @param {object} query The current `query` object from the Vizbuilder's state
 * @param {object} flags An object with flags and other state variables
 * @returns {object} The config for the chart of the corresponding type
 */

/**
 * @typedef {object} UserDefinedChartConfig
 * @prop {object} defaultConfig The general config params provided by the user
 * @prop {object} formatting An object with formatting functions for measure values. Keys are the value of measure.annotations.units_of_measurement
 * @prop {object} measureConfig The config params for specific measures provided by the user
 * @prop {object} topojson An object where keys are Level names and values are config params for the topojson properties
 * @prop {string[]} visualizations An array with valid visualization names to present
 */

/**
 * @typedef {object} CreateChartConfigResult
 * @prop {string} type The type of chart for this config
 * @prop {string} key A deterministic unique string to identify the chart
 * @prop {object} component The chart component this config is intended to use
 * @prop {object} config The config object for the chart
 */
