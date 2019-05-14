import yn from "yn";

import {fetchMembers} from "./fetch";
import {
  findByName,
  getMeasureMeta,
  getTimeLevel,
  getValidLevels,
  removeDuplicateLevels
} from "./sorting";
import {isGeoDimension, isValidGrouping} from "./validation";

/**
 * Generates a partial state object, whose elements
 * only depend on a measure.
 * @param {Cube[]} cubes A list with all the cubes available
 * @param {Measure} measure The currently selected Measure
 */
export function generateBaseState(cubes, measure, geomapLevels) {
  const cubeName = measure.annotations._cb_name;
  const cube = cubes.find(cube => cube.name === cubeName);

  const query = getMeasureMeta(cube, measure);
  query.measure = measure;
  query.cube = cube;
  query.timeLevel = getTimeLevel(cube);

  const options = {
    levels: getValidLevels(cube)
  };

  const uiParams = {
    activeChart: null,
    selectedTime: null
  };

  if (geomapLevels) {
    options.levels = options.levels.filter(
      lvl =>
        isGeoDimension(lvl.hierarchy.dimension) &&
        geomapLevels.indexOf(lvl.name) > -1
    );
  }

  removeDuplicateLevels(options.levels);

  return {options, query, uiParams};
}

/**
 * Updates the levels in the groupings of the current query with their namesake
 * from the cube in newQuery. It also loads and updates the members in the
 * respective groupings. If there's no level with the same name in the new cube,
 * deletes the grouping.
 * @param {VbQuery} query The old query to get the groupings from
 * @param {VbQuery} newQuery The new query to get the new levels from
 */
export function replaceLevelsInGroupings(query, newQuery) {
  const newCube = newQuery.cube;
  const promises = query.groups.map(grouping => {
    const level = grouping.level;

    if (!level) {
      return Promise.resolve(grouping);
    }

    let targetDimension, targetHierarchy, targetLevel;
    try {
      const dimensionName = level.hierarchy.dimension.name;
      targetDimension = newCube.dimensionsByName[dimensionName];
      targetHierarchy =
        findByName(level.hierarchy.name, targetDimension.hierarchies) ||
        findByName(level.name, targetDimension.hierarchies);
      targetLevel = targetHierarchy.getLevel(level.name);
    } catch (e) {
      return Promise.resolve(null);
    }

    const memberList = grouping.members;
    let newGrouping = grouping.setLevel(targetLevel);

    if (memberList.length === 0) {
      return Promise.resolve(newGrouping);
    }

    return fetchMembers(newQuery, targetLevel).then(members => {
      const memberKeys = {};
      for (let member, i = 0; (member = members[i]); i++) {
        memberKeys[member.key] = member;
      }
      for (let member, i = 0; (member = memberList[i]); i++) {
        const newMember = memberKeys[member.key];
        newGrouping = newGrouping.addMember(newMember);
      }
      return newGrouping;
    });
  });

  return Promise.all(promises).then(newGroups => newGroups.filter(Boolean));
}

export function replaceMeasureInFilters(filters, cube) {
  return filters.map(filter => {
    const measure = filter.measure;
    if (measure) {
      const measureName = measure.name;
      const targetMeasure = cube.measures.find(msr => msr.name === measureName);

      filter = filter.setMeasure(targetMeasure);
    }
    return filter;
  });
}

export function replaceKeysInString(string, oldList, newList, property) {
  if (typeof string !== "string") return string;

  property = property || 'key';

  for (let i = 0; i < newList.length; i++) {
    if (oldList[i][property] && newList[i][property]) {
      string = string.replace(oldList[i][property], newList[i][property]);
    }
  }

  return string;
}

/**
 * Generates an array of mondrian-rest-client queries from
 * the current parameters in Vizbuilder.
 * @param {Object} params The Vizbuilder `state.query` object.
 */
export function generateQueries(params) {
  const queries = [];

  const validGroups = [];
  const validNotCuts = [];
  const validCuts = [];
  const cutMap = new WeakMap();

  const totalGroups = params.groups.length;
  for (let i = 0; i < totalGroups; i++) {
    const grouping = params.groups[i];
    if (isValidGrouping(grouping)) {
      validGroups.push(grouping);

      if (grouping.hasMembers) {
        validCuts.push(grouping);
        cutMap.set(grouping.level, grouping);
      } else {
        validNotCuts.push(grouping);
      }
    }
  }
  /*
  const totalValidGroups = validGroups.length;

  for (let i = 0; i < totalValidGroups; i++) {
    const grouping = validGroups[i];
    const level = grouping.level;

    queries.push({
      ...params,
      kind: "s",
      level,
      levels: [level],
      cuts: [grouping].filter(isValidCut)
    });
  }

  if (totalValidGroups > 1) {
    const combinations = getCombinationsChoose2(validGroups);

    while (true) {
      const combination = combinations.next();
      if (combination.done) break;

      const groupings = combination.value;

      queries.push({
        ...params,
        kind: "d",
        level: groupings[0].level,
        levels: groupings.map(grp => grp.level),
        cuts: groupings.filter(isValidCut)
      });
    }
  }
*/
  // if (validCuts.length > 0) {
    let totalValidGroups = validGroups.length;
    const ddGroups = [];
    const ctGroups = [];

    for (let i = 0; i < totalValidGroups; i++) {
      const group = validGroups[i];
      const target = group.hasMembers ? ctGroups : ddGroups;
      target.push(group);
    }

    if (ddGroups.length === 0) {
      ddGroups.push(validGroups[0]);
    }

    queries.push({
      ...params,
      kind: "c",
      level: ddGroups[0].level,
      levels: ddGroups.map(grp => grp.level),
      cuts: ctGroups
    });
  // }

  return queries;
}

/**
 * Creates a query params object, ready to be converted into a
 * mondrian-rest-client Query object.
 * @param {object} params The current `query` object from the Vizbuilder state.
 */
export function queryConverter(params, includeConfidenceInt) {
  const measures = [
    params.measure.name,
    (includeConfidenceInt && params.moe) && params.moe.name,
    (includeConfidenceInt && params.lci) && params.lci.name,
    (includeConfidenceInt && params.uci) && params.uci.name
  ].filter(Boolean);

  const drilldownList = []
    .concat(params.levels, params.timeLevel)
    .filter(Boolean);

  // Add levels from required dimensions
  params.cube.dimensions.forEach(dimension => {
    if (
      yn(dimension.annotations.is_required) &&
      drilldownList.every(lvl => lvl.hierarchy.dimension !== dimension)
    ) {
      const firstLevel = dimension.hierarchies[0].levels[1];
      drilldownList.push(firstLevel);
    }
  });

  const drilldowns = drilldownList.map(lvl =>
    lvl.fullName.slice(1, -1).split("].[")
  );

  const cuts = params.cuts.map(group => group.serialize());

  const filters = params.filters
    .map(filter => filter.serialize())
    .filter(Boolean);

  return {
    queryObject: params.cube.query,
    measures,
    drilldowns,
    cuts,
    filters,
    // limit: undefined,
    // offset: undefined,
    // order: undefined,
    // orderDesc: undefined,
    options: {
      nonempty: true,
      distinct: false,
      parents: drilldownList.some(dd => dd.depth > 1),
      debug: false,
      sparse: true
    },
    // locale: "en"
  };
}

/**
 * Converts the params in the current `query` state to a
 * mondrian-rest-client Query object.
 * @param {object} params A query params object, ready to be implemented.
 * @returns {Query}
 */
export function queryBuilder(params) {
  let i, item;
  const query = params.queryObject;

  item = params.measures.length;
  for (i = 0; i < item; i++) {
    query.measure(params.measures[i]);
  }

  item = params.drilldowns.length;
  for (i = 0; i < item; i++) {
    query.drilldown(...params.drilldowns[i]);
  }

  for (i = 0; i < params.cuts.length; i++) {
    item = params.cuts[i];

    if (typeof item !== "string") {
      const key = item.key;
      item = item.values.map(v => `${key}.&[${v.key}]`).join(",");
      if (item.indexOf("],[") > -1) {
        item = `{${item}}`;
      }
    }

    query.cut(item);
  }

  item = params.filters.length;
  for (i = 0; i < item; i++) {
    query.filter(...params.filters[i]);
  }

  if (params.limit) {
    query.pagination(params.limit, params.offset);
  }

  if (params.order) {
    query.sorting(params.order, params.orderDesc);
  }

  for (item in params.options) {
    if (params.options.hasOwnProperty(item)) {
      query.option(item, params.options[item]);
    }
  }

  return query; // setLangCaptions(query, params.locale);
}
