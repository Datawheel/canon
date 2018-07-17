import {
  BarChart,
  Donut,
  Geomap,
  LinePlot,
  StackedArea,
  Treemap
} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {getAreaChartDimensions} from "./constants";
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

export const legendConfig = () => ({
  label: false,
  shapeConfig: {
    width: 0,
    height: 0
  }
});

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

export const timelineConfig = {
  // time: !isOpen ? "ID Year" : ""
};

const makeConfig = {
  barchart(commonConfig, query, flags) {
    // BAR CHART
    // Useful for discrete categories of data, specially integers.

    const {timeDrilldown, drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      discrete: "x",
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {title: measureName},
      stacked: drilldown.depth > 1
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
  barchartyear(commonConfig, query) {
    const {drilldown, timeDrilldown, measure} = query;

    const drilldownName = timeDrilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      discrete: "x",
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {title: measureName},
      stacked: true,
      groupBy: [drilldown.name],
      tooltipConfig: tooltipConfig(query, drilldownName)
    };

    return config;
  },
  histogram(commonConfig, query, flags) {
    // HISTOGRAM
    // Allows to see the frequency distribution of a continuous dataset.
    // Useful mainly with range buckets.

    const config = this.barchart(commonConfig, query, flags);
    config.groupPadding = 0;
    return config;
  },
  donut(commonConfig, query) {
    const {drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      xConfig: {title: null},
      y: measureName,
      yConfig: {title: measureName},
      groupBy: drilldownName
    };

    return config;
  },
  geomap(commonConfig, query, flags) {
    const drilldownName = query.drilldown.name;

    const config = {
      ...commonConfig,
      ...flags.colorScale,
      tiles: false,
      id: `ID ${drilldownName}`,
      groupBy: `ID ${drilldownName}`,
      ocean: "transparent",
      projection: "geoAlbersUsa",
      topojson: "/topojson/states.json",
      topojsonId: "id",
      topojsonKey: "states",
      zoom: true,
      zoomFactor: 2,
      zoomScroll: false
    };

    if (flags.activeType === "geomap") {
      const size = getAreaChartDimensions();
      config.colorScaleConfig = {
        scale: "jenks",
        height: size.height,
        width: size.width
      };
    }

    return config;
  },
  lineplot(commonConfig, query) {
    const {timeDrilldown, drilldown, measure, moe} = query;

    const drilldownName = timeDrilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      discrete: "x",
      groupBy: drilldown.hierarchy.levels[1].name,
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {title: measureName}
    };

    if (moe) {
      const moeName = moe.name;

      config.confidence = [
        d => d[measureName] - d[moeName],
        d => d[measureName] + d[moeName]
      ];
      config.confidenceConfig = {
        fillOpacity: 0.15
      };
    }

    return config;
  },
  stacked(commonConfig, query) {
    const config = this.lineplot(commonConfig, query);
    return config;
  },
  treemap(commonConfig, query) {
    const {drilldown, measure} = query;

    const levels = drilldown.hierarchy.levels;
    const ddIndex = levels.indexOf(drilldown);
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      groupBy: levels.slice(1, ddIndex + 1).map(lvl => lvl.name),
      y: measureName,
      yConfig: {title: measureName}
    };

    return config;
  }
};

export default function createChartConfig({
  activeType,
  query,
  availableKeys,
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

    tooltip: true,
    tooltipConfig: tooltipConfig(query),

    duration: 0,
    loadingMessage: "Loading",
    sum: getMeasureName,
    value: getMeasureName,
    totalConfig: {
      fontSize: 14
    }
  };

  const colorScale = {
    colorScale: measureName,
    colorScalePosition: "bottom",
    colorScaleConfig: {width: 0, height: 0}
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
      commonConfig.totalConfig = {
        fontSize: 10,
        padding: 5,
        resize: false,
        textAnchor: "middle"
      };
    }
  }

  const flags = {
    activeType,
    availableKeys,
    colorScale,
    year
  };

  return Array.from(availableCharts, type => ({
    type,
    config: makeConfig[type](commonConfig, query, flags)
  }));
}
