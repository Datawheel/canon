import {assign} from "d3plus-common";

// import {composeChartTitle} from "./formatting";
import {relativeStdDev} from "./math";
import {sortByCustomKey} from "./sorting";


const makeConfig = {
  barchart(chart) {
    const {timeLevel, level} = chart.query;
    const {levelName, measureName} = chart.names;

    const config = assign(
      {},
      chart.baseConfig,
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
        ySort: sortByCustomKey(levelName, chart.members[levelName])
      },
      chart.userConfig
    );

    if (timeLevel) {
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
  barchartyear(chart) {
    const {levelName, timeLevelName, measureName} = chart.names;

    const config = assign(
      {},
      chart.baseConfig,
      {
        // title: `${measureName} by ${levelName}, by ${timeLevelName}\n${flags.subtitle}`,
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
    delete config.timeFilter;
    delete config.timeline;
    delete config.timelineConfig;
    delete config.total;

    return config;
  },
  donut(chart) {
    const {levelName, measureName} = chart.names;

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

    return config;
  },
  geomap(chart) {
    const {names, query} = chart;
    const {levelName, measureName} = names;

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
      query.cuts &&
      query.cuts.find(cut => cut.key.indexOf(`[${levelName}]`) > -1);
    if (levelCut && !config.fitFilter) {
      const levelCutMembers = levelCut.values.map(member => member.key);
      config.fitFilter = d => levelCutMembers.indexOf(d.id) > -1;
    }

    return config;
  },
  histogram(chart) {
    const config = this.barchart(chart);

    return assign(
      config,
      {
        groupPadding: 0
      },
      chart.userConfig
    );
  },
  lineplot(chart) {
    const {measureName, moeName, lciName, uciName, timeLevelName} = chart.names;

    const config = assign(
      {},
      chart.baseConfig,
      {
        discrete: "x",
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

    if (lciName && uciName) {
      config.confidence = [d => d[lciName], d => d[uciName]];
    }
    else if (moeName) {
      config.confidence = [
        d => d[measureName] - d[moeName],
        d => d[measureName] + d[moeName]
      ];
    }

    delete config.time;
    delete config.timeFilter;
    delete config.timeline;
    delete config.timelineConfig;
    delete config.total;

    // config.title = composeChartTitle(flags, {timeline: true});

    return config;
  },
  lineplot_ab(chart) {
    return this.lineplot(chart);
  },
  pie(chart) {
    return this.donut(chart);
  },
  stacked(chart) {
    const {measureName} = chart.names;

    const config = this.lineplot(chart);
    config.yConfig = {scale: "linear", title: measureName};

    if (chart.setup.length > 1) {
      config.groupBy = chart.setup.map(lvl => lvl.name);
    }

    return config;
  },
  treemap(chart) {
    const {level} = chart.query;

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

    if (chart.setup.length > 1) {
      config.groupBy.push(chart.setup.slice(1).map(lvl => lvl.name));
    }

    return config;
  }
};

/**
 * Generates an array with valid config objects, depending on the type of data
 * retrieved and the current user defined parameters, to use in d3plus charts.
 */
export default function createChartConfig(
  chart,
  {activeChart, isSingle, isUnique, selectedTime, onTimeChange, uiheight}
) {
  const {chartType, members, names, query} = chart;
  const {measureName, timeLevelName} = names;
  const {measure} = query;

  const config = makeConfig[chartType](chart);

  config.data = chart.dataset;
  config.height = isSingle ? uiheight - (isUnique ? 50 : 0) : 400;

  const measureAnn = measure.annotations;

  const hasTimeDim = timeLevelName && members[timeLevelName].length;

  const subtitle = measureAnn._cb_tagline;

  if (hasTimeDim) {
    config.time = timeLevelName;
    config.timeFilter = d => d[timeLevelName] == selectedTime; // eslint-disable-line
    config.timeline = Boolean(activeChart);
    config.timelineConfig = {
      on: {end: onTimeChange}
    };
  }

  if (chart.aggType === "SUM" || chart.aggType === "UNKNOWN") {
    config.total = measureName;
  }

  if (chartType === "geomap" && isSingle) {
    config.zoom = true;
  }

  return config;
}
