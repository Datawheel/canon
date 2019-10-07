import {isGeoPlusUniqueCutQuery} from "./chartHelpers";
import {captionOrName} from "./formatting";
import {getTopTenByYear} from "./sorting";

export const QUIRKS = {
  TOPTEN: "topten"
};

/**
 * The main function here is chartCriteria
 * This function is in charge of deciding which charts will be rendered for each
 * dataset retrieved from the server.
 */
export default function chartCriteria(results, params) {
  /** @type {Datagroup[]} */
  const datagroups = [];

  for (let i = 0; i < results.length; i++) {
    /** @type {Datagroup} */
    const datagroup = results[i];
    datagroups.push(datagroup);

    let {members, query} = datagroup;

    const measureName = query.measure.name;
    const levelName = captionOrName(query.level);
    const levelNames = query.levels.map(captionOrName);
    const geoLevelName = captionOrName(query.geoLevel || "");
    const timeLevelName = captionOrName(query.timeLevel || "");

    const levelMembers = members[levelName] || [];
    const timeLevelMembers = members[timeLevelName] || [];

    const measureAnn = query.measure.annotations;
    const measureUnit = measureAnn.units_of_measurement;

    const measureFormatter =
      params.formatting[measureUnit] || params.formatting["default"];
    const topojsonConfig = params.topojson[levelName];

    const aggregatorType =
      measureAnn.pre_aggregation_method ||
      measureAnn.aggregation_method ||
      query.measure.aggregatorType ||
      "UNKNOWN";

    const availableCharts = new Set(params.visualizations);

    const hasTimeLvl = timeLevelName && timeLevelMembers.length > 1;
    const hasGeoLvl = Boolean(geoLevelName);

    // Hide barcharts with more than 20 members
    if (levelMembers.length > 20) {
      availableCharts.delete("barchart");
    }

    if (levelMembers.length > 200) {
      availableCharts.delete("stacked");
    }

    if (levelMembers.length > 1000) {
      availableCharts.delete("treemap");
    }

    // Hide time scale charts if dataset has not time or only one time
    if (!hasTimeLvl) {
      availableCharts.delete("barchartyear");
      availableCharts.delete("lineplot");
      availableCharts.delete("stacked");
    }

    // Hide geomaps if there no geo levels, or if there's less than 3 members
    if (
      !topojsonConfig ||
      !hasGeoLvl ||
      levelMembers.length < 3 ||
      (query.levels.length === 2 && !isGeoPlusUniqueCutQuery(query))
    ) {
      availableCharts.delete("geomap");
    }

    if (levelMembers.length > 1 && ["Percentage", "Rate"].indexOf(measureUnit) > -1) {
      availableCharts.delete("barchartyear");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
    }

    // Hide invalid charts according to the type of aggregation in the data
    if (aggregatorType === "AVG" || aggregatorType === "AVERAGE") {
      availableCharts.delete("donut");
      availableCharts.delete("histogram");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
    }
    else if (aggregatorType === "MEDIAN") {
      availableCharts.delete("stacked");
    }
    else if (aggregatorType === "NONE") {
      /** @see Issue#327 on {@link https://github.com/Datawheel/canon/issues/327 | GitHub} */
      availableCharts.delete("stacked");
      availableCharts.delete("barchart");
    }

    // Hide barchartyear and treemap if aggregation is not SUM or UNKNOWN
    if (aggregatorType !== "SUM" && aggregatorType !== "UNKNOWN") {
      availableCharts.delete("barchartyear");
      availableCharts.delete("treemap");
    }

    // Hide charts that would show a single shape only
    // (that is, if any drilldown, besides Year, only has 1 member)
    if (query.levels.every(lvl => (members[captionOrName(lvl)] || []).length === 1)) {
      availableCharts.delete("barchart");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
    }

    datagroup.aggType = aggregatorType;
    datagroup.formatter = measureFormatter;
    datagroup.names = {
      collectionName: captionOrName(query.collection || ""),
      lciName: captionOrName(query.lci || ""),
      levelName,
      measureName,
      moeName: captionOrName(query.moe || ""),
      sourceName: captionOrName(query.source || ""),
      timeLevelName,
      uciName: captionOrName(query.uci || ""),
      levelNames
    };

    /**
     * If there's more than 60 lines in a lineplot, only show top ten each year
     * due to the implementation, this remove lineplot from this datagroup
     * and creates a new datagroup, lineplot-only, for the new trimmed dataset
     * @see Issue#296 on {@link https://github.com/Datawheel/canon/issues/296 | GitHub}
     */
    const totalMembers = query.levels.reduce(
      (total, lvl) => total * (members[captionOrName(lvl)] || []).length,
      1
    );
    if (availableCharts.has("lineplot") && totalMembers > 60) {
      availableCharts.delete("lineplot");

      const {newDataset, newMembers} = getTopTenByYear(datagroup);
      const newTimeLevelMembers = newMembers[timeLevelName] || [];
      if (timeLevelName && newTimeLevelMembers.length > 1) {
        datagroups.push({
          ...datagroup,
          charts: ["lineplot"],
          dataset: newDataset,
          members: newMembers,
          quirk: QUIRKS.TOPTEN
        });
      }
    }

    datagroup.charts = Array.from(availableCharts);
  }

  return datagroups;
}

/**
 * @typedef Datagroup
 * @prop {string} aggType
 * @prop {string[]} charts
 * @prop {any[]} dataset
 * @prop {(d: number) => string} formatter
 * @prop {string} key
 * @prop {Object<string, number[]|string[]>} members
 * @prop {Object<string, string>} names
 * @prop {any} query
 * @prop {string} [quirk]
 */
