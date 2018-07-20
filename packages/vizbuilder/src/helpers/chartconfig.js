import {
  BarChart,
  Donut,
  Geomap,
  LinePlot,
  StackedArea,
  Treemap
} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {sortByGeographyState, sortByCustomKey} from "./sorting";

export const charts = {
  barchart: BarChart,
  barchartyear: BarChart,
  // histogram: BarChart,
  donut: Donut,
  geomap: Geomap,
  lineplot: LinePlot,
  stacked: StackedArea,
  treemap: Treemap
};

export const ALL_YEARS = "All years";

export const tooltipConfig = (query, keyTitle, keyBody) => {
  keyTitle = keyTitle || query.drilldown.name;
  keyBody = keyBody || query.measure.name;

  const config = {
    width: 60,
    title: d =>
      `<h5 class="title xs-small">${[].concat(d[keyTitle]).join("<br/>")}</h5>`
  };

  if (query.timeDrilldown && keyTitle !== "Year") {
    if (query.moe) {
      const moeName = query.moe.name;
      config.body = d =>
        `<div>
  <p>${keyBody}: ${formatAbbreviate(d[keyBody])}</p>
  <p>MOE: ±${formatAbbreviate(d[moeName])}</p>
  <p>Year: ${d.Year}</p>
  </div>`;
    }
    else {
      config.body = d =>
        `<div>
  <p>${keyBody}: ${formatAbbreviate(d[keyBody])}</p>
  <p>Year: ${d.Year}</p>
  </div>`;
    }
  }
  else {
    if (query.moe) {
      const moeName = query.moe.name;
      config.body = d =>
        `<div>
<p>${keyBody}: ${formatAbbreviate(d[keyBody])}</p>
<p>MOE: ±${formatAbbreviate(d[moeName])}</p>
</div>`;
    }
    else {
      config.body = d =>
        `<div>
<p>${keyBody}: ${formatAbbreviate(d[keyBody])}</p>
</div>`;
    }
  }

  return config;
};

const makeConfig = {
  barchart(commonConfig, query, flags) {
    const {timeDrilldown, drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const userConfig =
      flags.activeType == "barchart"
        ? flags.chartConfig.barchartActive
        : flags.chartConfig.barchart;

    const config = {
      ...commonConfig,
      title: `Barchart of ${measureName} by ${drilldownName}`,
      discrete: "x",
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {title: measureName},
      stacked: drilldown.depth > 1,
      ...userConfig
    };

    if (timeDrilldown) {
      config.groupBy = [timeDrilldown.hierarchy.levels[1].name];
    }

    if (flags.availableKeys.has("State")) {
      config.xSort = sortByGeographyState;
    }
    else {
      config.xSort = sortByCustomKey(drilldownName);
    }

    return config;
  },
  barchartyear(commonConfig, query, flags) {
    const {drilldown, timeDrilldown, measure} = query;

    const drilldownName = timeDrilldown.name;
    const measureName = measure.name;

    const userConfig =
      flags.activeType == "barchartyear"
        ? flags.chartConfig.barchartyearActive
        : flags.chartConfig.barchartyear;

    const config = {
      ...commonConfig,
      title: `Barchart of ${measureName} by ${drilldownName}`,
      discrete: "x",
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {title: measureName},
      stacked: true,
      groupBy: [drilldown.name],
      tooltipConfig: tooltipConfig(query, drilldownName),
      ...userConfig
    };

    return config;
  },
  histogram(commonConfig, query, flags) {
    const config = this.barchart(commonConfig, query, flags);

    const userConfig =
      flags.activeType == "histogram"
        ? flags.chartConfig.histogramActive
        : flags.chartConfig.histogram;

    return {
      ...config,
      // title: `Histogram of ${measureName} by ${drilldownName}`,
      groupPadding: 0,
      ...userConfig
    };
  },
  donut(commonConfig, query, flags) {
    const {drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const userConfig =
      flags.activeType == "donut"
        ? flags.chartConfig.donutActive
        : flags.chartConfig.donut;

    const config = {
      ...commonConfig,
      title: `Donut chart of ${measureName} by ${drilldownName}`,
      xConfig: {title: null},
      y: measureName,
      yConfig: {title: measureName},
      groupBy: drilldownName,
      ...userConfig
    };

    return config;
  },
  geomap(commonConfig, query, flags) {
    const drilldownName = query.drilldown.name;
    const measureName = query.measure.name;
    const isActive = flags.activeType === "geomap";

    const topojsonConfig =
      flags.topojson[drilldownName] || flags.topojson.default;

    const userConfig = isActive
        ? flags.chartConfig.geomapActive
        : flags.chartConfig.geomap;

    const config = {
      ...commonConfig,
      title: `Geomap of ${measureName} by ${drilldownName}`,
      colorScale: measureName,
      colorScalePosition: isActive ? "bottom" : false,
      groupBy: `ID ${drilldownName}`,
      zoomScroll: false,
      ...topojsonConfig,
      ...userConfig
    };

    if (isActive) {
      config.colorScaleConfig = {
        scale: "jenks"
      };
    }

    return config;
  },
  lineplot(commonConfig, query, flags) {
    const {timeDrilldown, drilldown, measure, moe} = query;

    const drilldownName = timeDrilldown.name;
    const measureName = measure.name;

    const userConfig =
      flags.activeType == "lineplot"
        ? flags.chartConfig.lineplotActive
        : flags.chartConfig.lineplot;

    const config = {
      ...commonConfig,
      title: `Line plot of ${measureName} by ${drilldownName}`,
      discrete: "x",
      groupBy: drilldown.hierarchy.levels[1].name,
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {title: measureName},
      ...userConfig
    };

    if (moe) {
      const moeName = moe.name;

      config.confidence = [
        d => d[measureName] - d[moeName],
        d => d[measureName] + d[moeName]
      ];
    }

    return config;
  },
  stacked(commonConfig, query, flags) {
    const config = this.lineplot(commonConfig, query, flags);

    const drilldownName = query.drilldown.name;
    const measureName = query.measure.name;

    const userConfig =
      flags.activeType == "stacked"
        ? flags.chartConfig.stackedActive
        : flags.chartConfig.stacked;

    return {
      ...config,
      title: `Stacked area chart of ${measureName} by ${drilldownName}`,
      ...userConfig
    };
  },
  treemap(commonConfig, query, flags) {
    const {drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const levels = drilldown.hierarchy.levels;
    const ddIndex = levels.indexOf(drilldown);

    const userConfig =
      flags.activeType == "treemap"
        ? flags.chartConfig.treemapActive
        : flags.chartConfig.treemap;

    const config = {
      ...commonConfig,
      title: `Treemap of ${measureName} by ${drilldownName}`,
      groupBy: levels.slice(1, ddIndex + 1).map(lvl => lvl.name),
      ...userConfig
    };

    return config;
  }
};

export default function createChartConfig({
  activeType,
  availableKeys,
  userConfig,
  query,
  year
}) {
  const availableCharts = new Set(
    activeType ? [activeType] : Object.keys(charts)
  );

  const measureName = query.measure.name;
  const getMeasureName = d => d[measureName];

  const commonConfig = {
    height: activeType ? 500 : 400,
    legend: false,

    tooltipConfig: tooltipConfig(query),

    duration: 0,
    sum: getMeasureName,
    value: getMeasureName,

    ...userConfig.chartConfig.common
  };

  if (!activeType) {
    const hasTimeDim = availableKeys.has("Year");
    const hasGeoDim = query.dimension.annotations.dim_type === "GEOGRAPHY";
    const aggregatorType =
      query.measure.annotations.aggregation_method ||
      query.measure.aggregatorType ||
      "UNKNOWN";

    if (!hasTimeDim || year !== ALL_YEARS) {
      availableCharts.delete("stacked");
      availableCharts.delete("barchartyear");
      availableCharts.delete("lineplot");
    }

    if (!hasGeoDim || year === ALL_YEARS) {
      availableCharts.delete("geomap");
    }

    if (aggregatorType === "AVERAGE") {
      availableCharts.delete("donut");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
      availableCharts.delete("histogram");
    }
    if (aggregatorType !== "SUM") {
      availableCharts.delete("treemap");
      availableCharts.delete("barchartyear");
    }
  }
  else {
    if (year !== ALL_YEARS) {
      commonConfig.total = getMeasureName;
    }
  }

  const flags = {
    activeType,
    availableKeys,
    topojson: userConfig.topojson || {},
    chartConfig: userConfig.chartConfig || {},
    year
  };

  return Array.from(availableCharts, type => ({
    type,
    config: makeConfig[type](commonConfig, query, flags)
  }));
}
