import keyBy from "lodash/keyBy";
import {createSelector} from "reselect";
import {levelIteratorFactory} from "../../helpers/arrays";
import {errorBuilder} from "../../helpers/error";
import {findByKey} from "../../helpers/find";
import {stateToPermalink} from "../../helpers/permalink";
import {isValidMeasure, removeDuplicateLevels} from "../../helpers/validation";
import {selectChartList} from "../charts/selectors";
import {
  selectCubeMap,
  selectMeasureMap,
  selectMeasureMapByTable
} from "../cubes/selectors";
import {
  selectGeomapLevels,
  selectInstanceParams,
  selectIsGeomapMode
} from "../instance/selectors";

/** @type {(state: GeneralState) => QueryState} */
export const selectQueryState = state => state.vizbuilder.query;

export const selectActiveChartKey = createSelector(
  selectQueryState,
  query => query.activeChart
);
export const selectActiveChart = createSelector(
  [selectChartList, selectActiveChartKey],
  (chartList, activeChart) => findByKey(`${activeChart}`, chartList)
);

export const selectGroupMap = createSelector(selectQueryState, query => query.groups);
export const selectGroupKeys = createSelector(selectGroupMap, map => Object.keys(map));
export const selectGroupList = createSelector(selectGroupMap, map => Object.values(map));
export const selectGroupDimensionList = createSelector(selectGroupList, groups =>
  groups.map(group => group.dimension)
);

export const selectFilterMap = createSelector(selectQueryState, query => query.filters);
export const selectFilterKeys = createSelector(selectFilterMap, map => Object.keys(map));
export const selectFilterList = createSelector(selectFilterMap, map =>
  Object.values(map)
);

/**
 * Returns a boolean indicating if the user wants to show confidence intervals
 * or margins of error in the charts.
 */
export const selectShowConfInt = createSelector(
  selectQueryState,
  query => query.showConfInt
);

/**
 * Returns the main time period currently selected by the user
 */
export const selectTimePeriod = createSelector(
  selectQueryState,
  query => query.timePeriod || undefined
);

/**
 * Returns the MeasureItem for the current measure.
 */
export const selectMeasure = createSelector(
  [selectMeasureMap, selectQueryState],
  (measureMap, queryState) => measureMap[queryState.measure]
);

/**
 * Returns the CubeItem for the parent cube to the current measure.
 */
export const selectCube = createSelector(
  [selectCubeMap, selectMeasure],
  (cubeMap, measure) => (measure ? cubeMap[measure.cube] : undefined)
);

/**
 * Returns a list of measures for the table name of the current measure
 */
export const selectMeasureListForTable = createSelector(
  [selectMeasure, selectMeasureMapByTable],
  (measure, tableMeasureMap) =>
    measure ? tableMeasureMap[`${measure.tableId}`] || [] : []
);

/**
 * Returns the list of sibling measures of the current state.query.measure,
 * respect to its parent cube.
 */
export const selectMeasureListForCube = createSelector(
  [selectCube, selectIsGeomapMode],
  (cube, geomapMode) =>
    cube
      ? cube.measures.filter(
          measure => !(geomapMode && measure.hideInMap) && isValidMeasure(measure)
        )
      : []
);

/**
 * Returns the MeasureItem containing the Lower Confidence Interval values
 * for the current Measure.
 */
export const selectLCIMeasureForCube = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isLCIFor === measureName);
    }
  }
);

/**
 * Returns the MeasureItem containing the Upper Confidence Interval values
 * for the current Measure.
 */
export const selectUCIMeasureForCube = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isUCIFor === measureName);
    }
  }
);

/**
 * Returns the MeasureItem containing the Margin of Error values for the
 * current Measure.
 */
export const selectMOEMeasureForCube = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isMOEFor === measureName);
    }
  }
);

/**
 * @returns {MeasureItem | undefined}
 */
export const selectSourceMeasureForCube = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isSourceFor === measureName);
    }
  }
);

/**
 * @returns {MeasureItem | undefined}
 */
export const selectCollectionMeasureForCube = createSelector(
  [selectMeasure, selectCube],
  (measure, cube) => {
    if (measure && cube) {
      const {name: measureName} = measure;
      return cube.measures.find(msr => msr.isCollectionFor === measureName);
    }
  }
);

/**
 * Returns a list of levels valid for user handling in the UI.
 */
export const selectLevelListForCube = createSelector(
  [selectCube, selectIsGeomapMode, selectGeomapLevels],
  (cube, geomapMode, geomapLevels) => {
    if (!cube) return [];

    const levels = [];
    const iterator = levelIteratorFactory(cube.dimensions);
    for (let step = iterator.next(); !step.done; step = iterator.next()) {
      const level = step.value;
      const showIfMap =
        !geomapMode || (!level.hideInMap && geomapLevels.includes(level.name));
      if (level.type !== "TIME" && !level.hideInUi && showIfMap) {
        levels.push(step.value);
      }
    }
    return removeDuplicateLevels(levels);
  }
);

/**
 * Returns a map of the currently valid levels available from the selected cube.
 */
export const selectLevelMapForCube = createSelector(selectLevelListForCube, levels =>
  keyBy(levels, i => i.uri)
);

/**
 * Returns a list of levels valid for user handling in the UI, but only the ones
 * whose dimension is not currently present in a GroupItem.
 */
export const selectUnusedLevelListForCube = createSelector(
  [selectGroupKeys, selectLevelListForCube],
  (groupKeys, levels) => levels.filter(lvl => !groupKeys.includes(lvl.dimension))
);

/**
 * Returns the first level it finds from a TIME-type dimension
 * in the current cube.
 */
export const selectTimeLevelForCube = createSelector(selectCube, cube => {
  if (cube) {
    const timeDimension = cube.dimensions.find(dimension => dimension.type === "TIME");
    if (timeDimension) {
      const defaultHierarchy = timeDimension.defaultHierarchy;
      const hierarchy = defaultHierarchy
        ? timeDimension.hierarchies.find(hierarchy => hierarchy.name === defaultHierarchy)
        : timeDimension.hierarchies[0];
      if (hierarchy) {
        return hierarchy.levels[0];
      }
    }
  }
});

/**
 * Returns the first level it finds from a GEOGRAPHY-type dimension
 * in the current cube.
 */
export const selectGeoLevelForCube = createSelector(
  [selectGroupList, selectCube],
  (groups, cube) => {
    if (!cube) {
      throw errorBuilder("InternalError", `selectGeoLevelForCube: Cube doesn't exist.`);
    }

    const geoDimensions = cube.dimensions.filter(dim => dim.type === "GEOGRAPHY");

    const iterator = levelIteratorFactory(geoDimensions);
    for (let step = iterator.next(); !step.done; step = iterator.next()) {
      const level = step.value;
      const isGeoLevel = groups.some(
        g =>
          g.level === level.name &&
          g.hierarchy === level.hierarchy &&
          g.dimension === level.dimension
      );
      if (isGeoLevel) {
        return level;
      }
    }
  }
);

/**
 * Returns a map of <dimension name, children level>,
 * for dimensions with the `isRequired` annotation.
 */
export const selectRequiredDimensionMapForCube = createSelector(selectCube, cube => {
  if (!cube) return {};

  /** @type {Record<string, LevelItem[]>} */
  const dimensions = {};
  const iterator = levelIteratorFactory(
    cube.dimensions.filter(dimension => dimension.isRequired)
  );
  for (let step = iterator.next(); !step.done; step = iterator.next()) {
    const level = step.value;
    const target = dimensions[level.dimension] || [];
    target.push(level);
    dimensions[level.dimension] = target;
  }

  return dimensions;
});

/**
 * Returns an object with the measure-related params of `QueryParams`.
 */
export const selectQueryParamMeasures = createSelector(
  [
    selectMeasureListForCube,
    selectFilterList,
    selectMeasure,
    selectShowConfInt,
    selectMOEMeasureForCube,
    selectLCIMeasureForCube,
    selectUCIMeasureForCube,
    selectCollectionMeasureForCube,
    selectSourceMeasureForCube
  ],
  (measures, filters, measure, showConfInt, moe, lci, uci, collection, source) => {
    const filterMeasures = measures.slice(0, 0);
    for (let item, i = 0; (item = filters[i]); i++) {
      const measure = measures.find(m => m.name === item.measure);
      if (measure && filterMeasures.indexOf(measure) === -1) {
        filterMeasures.push(measure);
      }
    }
    return showConfInt
      ? {collection, filterMeasures, filters, lci, measure, moe, source, uci}
      : {collection, filterMeasures, filters, measure, source};
  }
);

/**
 * Returns an object with the level-related params of `QueryParams`.
 */
export const selectQueryParamsDrillables = createSelector(
  [
    selectGroupList,
    selectLevelListForCube,
    selectTimeLevelForCube,
    selectGeoLevelForCube,
    selectRequiredDimensionMapForCube
  ],
  (groups, levelList, timeLevel, geoLevel, reqDimMap) => {
    const levelMapByHash = keyBy(levelList, i => i.hash);
    const levels = groups.map(group => levelMapByHash[group.hash]);
    const levelMap = keyBy(levels, i => i.dimension);

    if (timeLevel) {
      levelMap[timeLevel.dimension] = levelMap[timeLevel.dimension] || timeLevel;
    }

    Object.keys(reqDimMap).forEach(key => {
      levelMap[key] = levelMap[key] || reqDimMap[key][0];
    });

    /** @type {Record<string, string[]>} */
    const cuts = {};
    groups.forEach(group => {
      if (group.members.length > 0) {
        cuts[group.level] = group.members;
      }
    });

    const drilldowns = Object.values(levelMap);

    return {levels, groups, timeLevel, geoLevel, cuts, drilldowns};
  }
);

/**
 * Returns the map of search parameters to use in building the permalink.
 */
export const selectPermalinkKeywordsProp = createSelector(
  selectInstanceParams,
  /** @returns {PermalinkKeywordMap} */
  instance => ({
    confint: instance.permalinkConfint,
    enlarged: instance.permalinkEnlarged,
    filters: instance.permalinkFilters,
    groups: instance.permalinkGroups,
    measure: instance.permalinkMeasure,
    period: instance.permalinkPeriod
  })
);

/**
 * Returns the permalink query parameters as a string.
 */
export const selectPermalink = createSelector(
  [
    selectPermalinkKeywordsProp,
    selectQueryState,
    selectMeasure,
    selectFilterList,
    selectGroupList
  ],
  (permalinkKeywords, {activeChart, showConfInt, timePeriod}, measure, filters, groups) =>
    stateToPermalink(permalinkKeywords, {
      activeChart,
      filters,
      groups,
      measure,
      showConfInt,
      timePeriod
    })
);
