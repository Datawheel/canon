import {
  getCombinationsChoose2,
  getMeasureMeta,
  getTimeLevel,
  getValidLevels,
  removeDuplicateLevels
} from "./sorting";
import {isValidGrouping} from "./validation";

/**
 * Generates a partial state object, whose elements
 * only depend on a measure.
 * @param {Cube[]} cubes A list with all the cubes available
 * @param {Measure} measure The currently selected Measure
 */
export function generateBaseState(cubes, measure) {
  const cubeName = measure.annotations._cb_name;
  const cube = cubes.find(cube => cube.name === cubeName);

  const query = getMeasureMeta(cube, measure);
  query.measure = measure;
  query.cube = cube;
  query.timeLevel = getTimeLevel(cube);

  const options = {
    levels: getValidLevels(cube)
  };

  removeDuplicateLevels(options.levels);

  return {options, query};
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
      }
      else {
        validNotCuts.push(grouping);
      }
    }
  }

  const totalValidGroups = validGroups.length;

  for (let i = 0; i < totalValidGroups; i++) {
    const grouping = validGroups[i];
    const level = grouping.level;

    queries.push({
      ...params,
      key: grouping.key,
      level,
      cuts: grouping.hasMembers && [
        {key: level.fullName, values: grouping.members}
      ]
    });
  }

  if (totalValidGroups > 1) {
    const combinations = getCombinationsChoose2(validGroups);

    while (true) {
      const combination = combinations.next();
      if (combination.done) break;

      const grouping1 = combination.value[0];
      const grouping2 = combination.value[1];

      queries.push({
        ...params,
        key: `${grouping1.key}_${grouping2.key}`,
        level: grouping1.level,
        xlevel: grouping2.level,
        cuts: [
          grouping1.hasMembers && {
            key: grouping1.level.fullName,
            values: grouping1.members
          },
          grouping2.hasMembers && {
            key: grouping2.level.fullName,
            values: grouping2.members
          }
        ].filter(Boolean)
      });
    }
  }

  queries.reverse();

  return queries;
}

/**
 * Creates a query params object, ready to be converted into a
 * mondrian-rest-client Query object.
 * @param {object} params The current `query` object from the Vizbuilder state.
 */
export function queryConverter(params) {
  const measures = [
    params.measure.name,
    params.moe && params.moe.name,
    params.lci && params.lci.name,
    params.uci && params.uci.name
  ].filter(Boolean);

  const drilldownList = []
    .concat(params.level, params.xlevel, params.timeLevel)
    .filter(Boolean);
  const drilldowns = drilldownList.map(lvl => lvl.fullName.slice(1, -1).split("].["));

  const cuts = [].concat(params.cuts).filter(Boolean);

  const filters = params.filters
    .map(filter => filter.serialize())
    .filter(Boolean);

  return {
    queryObject: params.cube.query,
    measures,
    drilldowns,
    cuts,
    filters,
    limit: undefined,
    offset: undefined,
    order: undefined,
    orderDesc: undefined,
    options: {
      nonempty: true,
      distinct: false,
      parents: drilldownList.some(dd => dd.depth > 1),
      debug: false,
      sparse: true
    },
    locale: "en"
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
