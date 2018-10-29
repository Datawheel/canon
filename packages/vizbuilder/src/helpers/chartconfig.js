import {assign} from "d3plus-common";
import {formatAbbreviate} from "d3plus-format";
import {
  BarChart,
  Donut,
  Geomap,
  LinePlot,
  Pie,
  StackedArea,
  Treemap
} from "d3plus-react";

import {composeChartTitle} from "./formatting";
import {relativeStdDev} from "./math";
import {sortByCustomKey} from "./sorting";

export const charts = {
  barchart: BarChart,
  barchartyear: BarChart,
  donut: Donut,
  geomap: Geomap,
  lineplot: LinePlot,
  pie: Pie,
  stacked: StackedArea,
  treemap: Treemap
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
 * @type {Object<string,ChartConfigFunction>}
 */
const makeConfig = {
  barchart(commonConfig, query, flags) {
    const {timeLevel, level, measure} = query;

    const levelName = level.name;
    const measureName = measure.name;

    const config = assign(
      {},
      commonConfig,
      {
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
        ySort: sortByCustomKey(levelName, flags.members[levelName])
      },
      flags.chartConfig
    );

    if (timeLevel) {
      config.groupBy = [timeLevel.hierarchy.levels[1].name];
    }

    if (!config.time) {
      delete config.total;
    }

    return config;
  },
  barchart_ab(commonConfig, query, flags) {
    const config = this.barchart(commonConfig, query, flags);
    // config.y = query.level.name;
    config.groupBy = [query.xlevel.name];
    return config;
  },
  barchartyear(commonConfig, query, flags) {
    const {level, timeLevel, measure} = query;

    const levelName = level.name;
    const timeLevelName = timeLevel.name;
    const measureName = measure.name;

    const config = assign(
      {},
      commonConfig,
      {
        title: `${measureName} by ${levelName}, by ${timeLevelName}\n${flags.subtitle}`,
        discrete: "x",
        x: timeLevelName,
        xConfig: {title: timeLevelName},
        y: measureName,
        stacked: true,
        groupBy: [levelName]
      },
      flags.chartConfig
    );

    delete config.time;
    delete config.total;

    return config;
  },
  donut(commonConfig, query, flags) {
    const {level, measure} = query;

    const levelName = level.name;
    const measureName = measure.name;

    const config = assign(
      {},
      commonConfig,
      {
        y: measureName,
        groupBy: [levelName]
      },
      flags.chartConfig
    );

    return config;
  },
  donut_ab(commonConfig, query, flags) {
    const config = this.donut(commonConfig, query, flags);
    config.groupBy = [query.level.name, query.xlevel.name];
    return config;
  },
  geomap(commonConfig, query, flags) {
    const levelName = query.level.name;
    const measureName = query.measure.name;

    const config = assign(
      {},
      commonConfig,
      {
        colorScale: measureName,
        colorScaleConfig: {
          axisConfig: {tickFormat: flags.measureFormatter},
          scale: "jenks"
        },
        colorScalePosition: "right",
        groupBy: [`ID ${levelName}`],
        zoomScroll: false
      },
      flags.topojsonConfig,
      flags.chartConfig
    );

    if (!flags.activeType) {
      config.zoom = false;
    }

    const levelCut =
      query.cuts &&
      query.cuts.find(cut => cut.key.indexOf(`[${levelName}]`) > -1);
    if (levelCut) {
      const levelCutMembers = levelCut.values.map(member => member.key);
      config.fitFilter = d => levelCutMembers.indexOf(d.id) > -1;
    }

    return config;
  },
  geomap_ab(commonConfig, query, flags) {
    const level1Name = query.level.name;
    const level2Name = query.xlevel.name;
    const config = this.geomap(commonConfig, query, flags);
    config.groupBy = [level1Name, level2Name];
    return config;
  },
  histogram(commonConfig, query, flags) {
    const config = this.barchart(commonConfig, query, flags);

    return assign(
      config,
      {
        groupPadding: 0
      },
      flags.chartConfig
    );
  },
  lineplot(commonConfig, query, flags) {
    const {level, measure, moe, lci, uci, member, timeLevel, xlevel} = query;

    const timeLevelName = timeLevel.name;
    const measureName = measure.name;

    const config = assign(
      {},
      commonConfig,
      {
        discrete: "x",
        groupBy: [level.name, xlevel && xlevel.name].filter(Boolean),
        yConfig: {scale: "linear", title: measureName},
        x: timeLevelName,
        xConfig: {title: timeLevelName},
        y: measureName
      },
      flags.chartConfig
    );

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

    if (!config.time) {
      delete config.total;
    }

    delete config.time;

    config.title = composeChartTitle(flags, {timeline: true});

    return config;
  },
  lineplot_ab(commonConfig, query, flags) {
    return this.lineplot(commonConfig, query, flags);
  },
  pie(commonConfig, query, flags) {
    return this.donut(commonConfig, query, flags);
  },
  pie_ab(commonConfig, query, flags) {
    const config = this.pie(commonConfig, query, flags);
    config.groupBy = [query.level.name, query.xlevel.name];
    return config;
  },
  stacked(commonConfig, query, flags) {
    const config = this.lineplot(commonConfig, query, flags);
    const measureName = query.measure.name;

    config.yConfig = {scale: "linear", title: measureName};

    return config;
  },
  stacked_ab(commonConfig, query, flags) {
    const config = this.stacked(commonConfig, query, flags);
    config.groupBy = [query.level.name, query.xlevel.name];
    return config;
  },
  treemap(commonConfig, query, flags) {
    const {level} = query;

    const levels = level.hierarchy.levels;
    const ddIndex = levels.indexOf(level);

    const config = assign(
      {},
      commonConfig,
      {
        groupBy: levels.slice(1, ddIndex + 1).map(lvl => lvl.name)
      },
      flags.chartConfig
    );

    return config;
  },
  treemap_ab(commonConfig, query, flags) {
    const {level, measure, timeLevel, xlevel} = query;
    const config = assign({}, commonConfig, flags.chartConfig);

    const levels = level.hierarchy.levels;
    const ddIndex = levels.indexOf(level);

    const groupBy = levels.slice(1, ddIndex + 1).map(lvl => lvl.name);
    groupBy.push(xlevel.name);

    config.groupBy = groupBy;
    config.title = composeChartTitle(flags, {levels: [level.name, xlevel.name]});

    return config;
  },
  treemap_ba(commonConfig, query, flags) {
    const {level, measure, timeLevel, xlevel} = query;
    const config = assign({}, commonConfig, flags.chartConfig);

    const levels = xlevel.hierarchy.levels;
    const ddIndex = levels.indexOf(xlevel);

    const groupBy = levels.slice(1, ddIndex + 1).map(lvl => lvl.name);
    groupBy.push(level.name);

    config.groupBy = groupBy;
    config.title = composeChartTitle(flags, {levels: [xlevel.name, level.name]});

    return config;
  }
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
    const tokens = activeType.split("-");
    if (tokens.indexOf(queryKey) !== 0) {
      return [];
    }
    activeType = tokens.pop();
  }

  const availableKeys = Object.keys(members);
  const availableCharts = new Set(activeType ? [activeType] : visualizations);

  const measure = query.measure;
  const measureName = measure.name;
  const measureAnn = measure.annotations;
  const measureFormatter =
    formatting[measureAnn.units_of_measurement] || formatAbbreviate;
  const getMeasureValue = d => d[measureName];

  const levelName = query.level.name;
  const xlevelName = query.xlevel && query.xlevel.name;
  const timeLevelName = query.timeLevel && query.timeLevel.name;
  const dimension = query.level.hierarchy.dimension;

  const hasTimeDim = timeLevelName && members[timeLevelName].length;
  const hasGeoDim = dimension.annotations.dim_type === "GEOGRAPHY";

  const aggregatorType =
    measureAnn.pre_aggregation_method ||
    measureAnn.aggregation_method ||
    measure.aggregatorType ||
    "UNKNOWN";

  const subtitle = measureAnn._cb_tagline;

  const commonConfig = {
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
    totalFormat: measureFormatter,

    xConfig: {title: null},
    yConfig: {
      title: measureName,
      tickFormat: measureFormatter
    },

    duration: 0,
    total: false,
    sum: getMeasureValue,
    value: getMeasureValue
  };

  if (hasTimeDim) {
    commonConfig.time = timeLevelName;
    commonConfig.timeline = Boolean(activeType);
  }

  if (aggregatorType === "SUM" || aggregatorType === "UNKNOWN") {
    commonConfig.total = getMeasureValue;
  }

  const topojsonConfig = topojson[levelName];

  if (!activeType) {
    if (members[levelName].length > 20) {
      availableCharts.delete("barchart");
    }

    let totalMembers = members[levelName].length;
    if (xlevelName) {
      totalMembers *= members[xlevelName].length;
    }
    if (totalMembers > 60) {
      availableCharts.delete("lineplot");
      availableCharts.delete("stacked");
    }

    if (!hasTimeDim || members[timeLevelName].length === 1) {
      availableCharts.delete("barchartyear");
      availableCharts.delete("lineplot");
      availableCharts.delete("stacked");
    }

    if (!hasGeoDim || !topojsonConfig || members[levelName].length < 3) {
      availableCharts.delete("geomap");
    }

    if (aggregatorType === "AVERAGE") {
      availableCharts.delete("donut");
      availableCharts.delete("histogram");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
    }
    else if (aggregatorType === "MEDIAN") {
      availableCharts.delete("stacked");
    }

    if (aggregatorType !== "UNKNOWN" && aggregatorType !== "SUM") {
      availableCharts.delete("barchartyear");
      availableCharts.delete("treemap");
    }

    if (availableKeys.some(d => d !== "Year" && members[d].length === 1)) {
      availableCharts.delete("barchart");
      availableCharts.delete("barchartyear");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
    }

    if (xlevelName) {
      if (availableCharts.has("barchart")) {
        availableCharts.delete("barchart");
        availableCharts.add("barchart_ab");
      }

      if (availableCharts.has("donut")) {
        availableCharts.delete("donut");
        availableCharts.add("donut_ab");
      }

      if (availableCharts.has("geomap")) {
        availableCharts.delete("geomap");
        availableCharts.add("geomap_ab");
      }

      if (availableCharts.has("lineplot")) {
        availableCharts.delete("lineplot");
        availableCharts.add("lineplot_ab");
      }

      if (availableCharts.has("stacked")) {
        availableCharts.delete("stacked");
        availableCharts.add("stacked_ab");
      }

      if (availableCharts.has("treemap")) {
        availableCharts.delete("treemap");
        availableCharts.add("treemap_ab");
        availableCharts.add("treemap_ba");
      }
    }
  }

  const currentMeasureConfig = measureConfig[measureName] || {};

  const flags = {
    activeType,
    aggregatorType,
    availableKeys,
    dataset,
    measureFormatter,
    members,
    query,
    subtitle,
    topojsonConfig,
    chartConfig: {
      ...defaultConfig,
      ...currentMeasureConfig
    }
  };

  commonConfig.title = composeChartTitle(flags);

  return Array.from(availableCharts, functionName => {
    const chartType = functionName.split("_")[0];
    return (
      charts.hasOwnProperty(chartType) &&
      makeConfig.hasOwnProperty(functionName) && {
        key: `${queryKey}-${functionName}`,
        component: charts[chartType],
        config: makeConfig[functionName](commonConfig, query, flags)
      }
    );
  }).filter(Boolean);
}

/**
 * @typedef {(commonConfig, query, flags: ConfigFunctionFlags) => object} ChartConfigFunction
 * @param {object} commonConfig The common config between all charts
 * @param {object} query The current `query` object from the Vizbuilder's state
 * @param {ConfigFunctionFlags} flags An object with flags and other state variables
 * @returns {object} The config for the chart of the corresponding type
 */

/**
 * @typedef {object} ConfigFunctionFlags
 * @prop {string} [activeType]
 * @prop {string} aggregatorType
 * @prop {string[]} availableKeys
 * @prop {object} chartConfig
 * @prop {object[]} dataset
 * @prop {(value: number) => string} measureFormatter
 * @prop {string[]} members
 * @prop {object} topojsonConfig
 * @prop {object} subtitle
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
