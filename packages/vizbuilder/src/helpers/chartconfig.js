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
  barchartyear: BarChart,
  donut: Donut,
  geomap: Geomap,
  // histogram: BarChart,
  lineplot: LinePlot,
  pie: Pie,
  stacked: StackedArea,
  treemap: Treemap
};

export const ALL_YEARS = "All years";

export const tooltipGenerator = (query, drilldowns, measureFormatter) => {
  const {drilldownName, measureName, moe, lci, uci, source, collection} = query;
  const tbody = drilldowns.filter(d => d !== drilldownName).map(dd => [dd, d => d[dd]]);
  tbody.push([measureName, d => measureFormatter(d[measureName])]);

  if (lci && uci) {
    const lciName = lci.name;
    const uciName = uci.name;
    tbody.push([
      "Confidence Interval",
      d =>
        `[${measureFormatter(d[lciName] * 1 || 0)}, ${measureFormatter(
          d[uciName] * 1 || 0
        )}]`
    ]);
  }
  else if (moe) {
    const moeName = moe.name;
    tbody.push([
      "Margin of Error",
      d => `± ${measureFormatter(d[moeName] * 1 || 0)}`
    ]);
  }

  if (source) {
    const sourceName = source.name;
    tbody.push(["Source", d => `${d[sourceName]}`]);
  }
  if (collection) {
    const collectionData = collection.name;
    tbody.push(["Collection", d => `${d[collectionData]}`]);
  }
  return {
    title: d => [].concat(d[drilldownName]).join(", "),
    tbody
  };
};

/**
 * @prop {[x: string]: ChartConfigFunction}
 */
const makeConfig = {
  barchart(commonConfig, query, flags) {
    const {timeDrilldown, drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      discrete: "y",
      label: d => d[drilldownName],
      y: drilldownName,
      yConfig: {title: drilldownName, ticks: []},
      x: measureName,
      stacked: drilldown.depth > 1,
      shapeConfig: {
        Bar: {
          labelConfig: {
            textAnchor: "start"
          }
        }
      },
      ySort: sortByCustomKey(drilldownName),
      ...flags.chartConfig
    };

    if (timeDrilldown) {
      config.groupBy = [timeDrilldown.hierarchy.levels[1].name];
    }

    return config;
  },
  barchartyear(commonConfig, query, flags) {
    const {drilldown, timeDrilldown, measure} = query;

    const drilldownName = timeDrilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      title: `${measureName} by ${drilldownName}`,
      discrete: "x",
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      stacked: true,
      groupBy: [drilldown.name],
      ...flags.chartConfig
    };

    delete config.time;

    return config;
  },
  donut(commonConfig, query, flags) {
    const {drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      y: measureName,
      groupBy: drilldownName,
      ...flags.chartConfig
    };

    return config;
  },
  geomap(commonConfig, query, flags) {
    const drilldownName = query.drilldown.name;
    const measureName = query.measure.name;

    const config = {
      ...commonConfig,
      colorScale: measureName,
      colorScaleConfig: {scale: "jenks"},
      colorScalePosition: "right",
      groupBy: `ID ${drilldownName}`,
      zoomScroll: false,
      ...flags.topojsonConfig,
      ...flags.chartConfig
    };

    if (!flags.activeType) {
      config.zoom = false;
    }

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
    const {drilldown, measure, moe, lci, uci, timeDrilldown} = query;

    const drilldownName = timeDrilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      title: `${measureName} by ${drilldownName}`,
      discrete: "x",
      groupBy: drilldown.name,
      yConfig: {scale: "linear", title: measureName},
      x: drilldownName,
      xConfig: {title: drilldownName},
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
  pie(commonConfig, query, flags) {
    return this.donut(commonConfig, query, flags);
  },
  stacked(commonConfig, query, flags) {
    const config = this.lineplot(commonConfig, query, flags);

    const drilldownName = query.drilldown.name;
    const measureName = query.measure.name;

    config.title = `${measureName} by ${drilldownName}`;
    if (query.member) {
      config.title += ` (${query.member.name})`;
    }

    return config;
  },
  treemap(commonConfig, query, flags) {
    const {drilldown} = query;

    const levels = drilldown.hierarchy.levels;
    const ddIndex = levels.indexOf(drilldown);

    const config = {
      ...commonConfig,
      groupBy: levels.slice(1, ddIndex + 1).map(lvl => lvl.name),
      ...flags.chartConfig
    };

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
  const memberKey = query.member ? `${query.member.key}` : "";

  // this prevents execution when the activeChart isn't for this query
  if (activeType) {
    let activeKey = activeType.split("_");
    activeType = activeKey.shift();
    activeKey = activeKey.join("_");

    if (activeKey !== memberKey) {
      return [];
    }
  }

  const availableKeys = Object.keys(members);
  const availableCharts = new Set(activeType ? [activeType] : visualizations);

  const drilldownName = query.drilldown.name;
  const timeDrilldownName = query.timeDrilldown && query.timeDrilldown.name;

  const measure = query.measure;
  const measureName = measure.name;
  const measureUnits = measure.annotations.units_of_measurement;
  const measureFormatter = formatting[measureUnits] || formatAbbreviate;
  const getMeasureValue = d => d[measureName];

  const hasTimeDim = timeDrilldownName && Array.isArray(members[timeDrilldownName]);
  const hasGeoDim = query.dimension.annotations.dim_type === "GEOGRAPHY";

  const aggregatorType = measure.annotations.aggregation_method || measure.aggregatorType || "UNKNOWN";

  const commonConfig = {
    title: `${measureName} by ${drilldownName}`,
    data: dataset,
    height: activeType ? 500 : 400,
    legend: false,

    tooltipConfig: tooltipGenerator(
      {
        drilldownName,
        measureName,
        moe: query.moe,
        lci: query.lci,
        uci: query.uci
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
    commonConfig.time = timeDrilldownName;
  }

  if (aggregatorType === "SUM" || aggregatorType === "UNKNOWN") {
    commonConfig.total = getMeasureValue;
  }

  const topojsonConfig = topojson[drilldownName];

  if (!activeType) {
    if (members[drilldownName].length > 20) {
      availableCharts.delete("barchart");
    }

    if (!hasTimeDim || members[timeDrilldownName].length === 1) {
      availableCharts.delete("stacked");
      availableCharts.delete("barchartyear");
      availableCharts.delete("lineplot");
    }

    if (!hasGeoDim || !topojsonConfig || members[drilldownName].length === 1) {
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

  return Array.from(
    availableCharts,
    chartType =>
      charts.hasOwnProperty(chartType) && {
        key: chartType + (memberKey ? `_${memberKey}` : ""),
        component: charts[chartType],
        config: makeConfig[chartType](commonConfig, query, flags)
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
