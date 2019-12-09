import {unique} from "shorthash";
import {getPermutations, getTopTenByYear} from "./arrays";
import {datasetToMemberMap} from "./transform";

/**
 * @param {Chart[]} charts
 * @param {Datagroup} dg
 */
export function chartCombinationReducer(charts, dg) {
  return dg.visualizations.reduce((charts, chartType) => {
    const newCharts =
      chartType in chartDistiller
        ? chartDistiller[chartType](dg)
        : chartDistiller.default(chartType, dg);
    return charts.concat(newCharts);
  }, charts);
}

const chartDistiller = {

  /**
   * @param {"barchart" | "barchartyear" | "donut" | "geomap" | "histogram" | "lineplot" | "pie" | "stacked" | "treemap"} chartType
   * @param {Datagroup} dg
   * @returns {Chart[]}
   */
  default(chartType, {dataset, memberList, params}) {
    const levelNames = params.levels.map(i => i.caption);
    return [
      {
        chartType,
        data: dataset,
        key: unique(`${levelNames}|${dataset.length}|${chartType}`),
        members: memberList,
        params
      }
    ];
  },

  /**
   * BARCHART
   *
   * @type {(dg: Datagroup) => Chart[]}
   */
  barchart(dg) {
    const {memberCount, params} = dg;
    const {levels, measure} = params;
    const firstLevel = levels[0];

    if (

      /** Barcharts with more than 20 members are hard to read. */
      memberCount[firstLevel.caption] > 20 ||

      /** @see {@link https://github.com/Datawheel/canon/issues/327} */
      measure.aggregationType === "NONE" ||

      /** Disable if all levels, except for timeLevel, have only 1 member. */
      levels.every(lvl => memberCount[lvl.caption] === 1)
    ) {
      return [];
    }

    return chartDistiller.default("barchart", dg);
  },

  /**
   * BARCHART FOR YEARS
   * - timeLevel required
   *
   * @type {(dg: Datagroup) => Chart[]}
   */
  barchartyear(dg) {
    const {memberCount, params} = dg;
    const {levels, timeLevel, measure} = params;
    const firstLevel = levels[0];

    if (

      /**
       * timeLevel is required for obvious reasons
       */
      !timeLevel ||
      memberCount[timeLevel.caption] < 2 ||

      /**
       * Stacked bars only work with SUM-aggregated measures
       */
      !["SUM", "UNKNOWN"].includes(measure.aggregationType) ||

      /**
       * Barcharts with more than 20 members are hard to read.
       */
      memberCount[firstLevel.caption] > 20 ||

      /**
       * If there's more than 1 level, Percentage and Rate should not be stackable
       * @see {@link https://github.com/Datawheel/canon/issues/487}
       */
      levels.length > 1 && ["Percentage", "Rate"].includes(measure.unit) ||

      /**
       * Disable if all levels, except for timeLevel, have only 1 member.
       */
      levels.every(lvl => memberCount[lvl.caption] === 1)
    ) {
      return [];
    }

    return chartDistiller.default("barchart", dg);
  },

  /**
   * DONUT CHART
   *
   * @type {(dg: Datagroup) => Chart[]}
   */
  donut(dg) {
    if (

      /**
       * Donut charts don't work with non-SUM measures
       */
      !["SUM", "UNKNOWN"].includes(dg.params.measure.aggregationType)
    ) {
      return [];
    }

    return chartDistiller.default("donut", dg);
  },

  /**
   * GEOMAPS
   * - geoLevel required
   *
   * @type {(dg: Datagroup) => Chart[]}
   */
  geomap(dg) {
    const {geoLevel, levels, cuts} = dg.params;

    if (

      /** Disable if there's no user-defined topojson config for the geoLevel */
      !dg.hasTopojsonConfig ||

      /** Disable if there's no geoLevel in this query */
      !geoLevel
    ) {
      return [];
    }

    const geoLevelName = geoLevel.caption;
    const geoLevelMembers = dg.memberList[geoLevelName] || [];

    const isGeoPlusUniqueCutQuery = () => {
      const notGeoLvl = levels.find(lvl => lvl.caption !== geoLevelName);
      if (notGeoLvl) {
        const notGeoLvlCut = cuts[notGeoLvl.caption];
        return notGeoLvlCut && notGeoLvlCut.length === 1;
      }
      return false;
    };

    if (

      /** Disable if the geoLevel has less than 3 regions */
      geoLevelMembers.length < 3 ||

      /** If besides geoLevel, there's another level with only one cut */
      levels.length === 2 && !isGeoPlusUniqueCutQuery()
    ) {
      return [];
    }

    return chartDistiller.default("geomap", dg);
  },

  /**
   * HISTOGRAM
   *
   * @type {(dg: Datagroup) => Chart[]}
   */
  histogram(dg) {
    if (dg.params.measure.aggregationType !== "BUCKET") {
      return [];
    }

    return chartDistiller.barchart(dg);
  },

  /**
   * LINEPLOTS
   * - timeLevel required.
   *
   * @type {(dg: Datagroup) => Chart[]}
   */
  lineplot(dg) {
    const {params, memberCount} = dg;
    const {timeLevel, levels} = params;

    /** timeLevel is required on stacked area charts */
    if (!timeLevel || memberCount[timeLevel.caption] < 2) {
      return [];
    }

    const timesFn = (total, lvl) => total * memberCount[lvl.caption];
    const memberTotal = levels.reduce(timesFn, 1);

    /*
     * If there's more than 60 lines in a lineplot, only show top ten each year
     * due to the implementation, this remove lineplot from this datagroup
     * and creates a new datagroup, lineplot-only, for the new trimmed dataset.
     * @see Issue#296 on {@link https://github.com/Datawheel/canon/issues/296 | GitHub}
     */
    if (memberTotal > 60) {
      const timeLevelName = timeLevel.caption;
      const levelName1 = levels[0].caption;

      const newDataset = getTopTenByYear(dg.dataset, {timeLevelName, levelName1});
      const levelCaptions = params.drilldowns.map(i => i.caption);
      const {memberMap} = datasetToMemberMap(newDataset, levelCaptions);
      const levelNames = levels.map(i => i.caption);

      return [
        {
          chartType: "lineplot",
          data: newDataset,
          isTopTen: true,
          key: unique(`${levelNames}|${newDataset.length}|lineplot`),
          members: memberMap,
          params
        }
      ];
    }

    return chartDistiller.default("lineplot", dg);
  },

  /**
   * STACKED AREA
   * - timeLevel required.
   *
   * @type {(dg: Datagroup) => Chart[]}
   */
  stacked(dg) {
    const {memberCount, params} = dg;
    const {levels, timeLevel, drilldowns, measure} = params;

    if (

      /** timeLevel is required on stacked area charts */
      !timeLevel ||
      memberCount[timeLevel.caption] < 2 ||

      /** @see {@link https://github.com/Datawheel/canon/issues/327} */
      ["AVG", "AVERAGE", "MEDIAN", "NONE"].indexOf(measure.aggregationType) > -1 ||

      /** Disable if there will be more than 200 shapes in the chart */
      levels.reduce((total, lvl) => total * memberCount[lvl.caption], 1) > 200 ||

      /** @see {@link https://github.com/Datawheel/canon/issues/487} */
      ["Percentage", "Rate"].indexOf(measure.unit) > -1 &&
        memberCount[levels[0].caption] > 1 ||

      /** Disable if all levels, especially timeLevel, contain only 1 member */
      drilldowns.every(lvl => memberCount[lvl.caption] === 1)
    ) {
      return [];
    }

    return chartDistiller.default("stacked", dg);
  },

  /**
   * TREEMAPS
   *
   * @type {(dg: Datagroup) => Chart[]}
   */
  treemap({dataset, memberCount, memberList, params}) {
    const {levels, measure} = params;
    const {aggregationType} = params.measure;

    if (

      /** Treemaps only work with SUM-aggregated measures  */
      aggregationType !== "SUM" && aggregationType !== "UNKNOWN" ||

      /**
       * Disable if there will be more than 1000 shapes in the chart
       * TODO: Implement threshold parameters and remove this
       */
      levels.reduce((total, lvl) => total * memberCount[lvl.caption], 1) > 1000 ||

      /** @see {@link https://github.com/Datawheel/canon/issues/487} */
      ["Percentage", "Rate"].indexOf(measure.unit) > -1 &&
        memberCount[levels[0].caption] > 1 ||

      /** Disable if all levels, except for timeLevel, have only 1 member. */
      params.levels.every(lvl => memberCount[lvl.caption] === 1)
    ) {
      return [];
    }

    const relevantLevels = params.levels.filter(lvl => memberCount[lvl.caption] > 1);
    return getPermutations(relevantLevels).map(levels => {
      const levelNames = levels.map(i => i.caption);
      return {
        chartType: "treemap",
        data: dataset,
        key: unique(`${levelNames}|${dataset.length}|treemap`),
        members: memberList,
        params: {...params, levels}
      };
    });
  }
};
