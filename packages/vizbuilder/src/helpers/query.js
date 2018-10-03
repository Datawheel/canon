import {getMeasureMeta, getTimeLevel, getValidLevels} from "./sorting";
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

  /*
  Generate combination queries
  -
  For each `Cut`, makes a query for every
  C(n,2) combination of all levels.
   */

  const totalValidGroups = validGroups.length;
  if (totalValidGroups > 1) {
    for (let j = 0; j < totalValidGroups - 1; j++) {
      for (let k = 1; k < totalValidGroups; k++) {
        const currGroup = validGroups[j].level;
        const nextGroup = validGroups[k].level;

        const cuts = [cutMap.get(currGroup), cutMap.get(nextGroup)]
          .map(grouping => grouping && grouping.serialize());

        console.log("query.cross");
        queries.push({
          ...params,
          key: `${currGroup.annotations._key}~${nextGroup.annotations._key}`,
          cuts,
          level: currGroup,
          xlevel: nextGroup
        });
      }
    }
  }

  for (let i = 0; i < validGroups.length; i++) {
    const grouping = validGroups[i];
    const level = grouping.level;

    console.log("query.unilevel", level.name);
    queries.push({
      ...params,
      key: level.annotations._key,
      level,
      cuts: grouping.hasMembers && [
        {key: level.fullName, values: grouping.members}
      ]
    });
  }

  console.table(queries, [
    "key",
    "cuts",
    "filters",
    "level",
    "xlevel",
    "measure"
  ]);
  console.debug(queries);

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

  const drilldowns = []
    .concat(params.level, params.xlevel, params.timeLevel)
    .filter(Boolean)
    .map(lvl => lvl.fullName.slice(1, -1).split("].["));

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
      parents: params.level.depth > 1,
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
  let query = params.queryObject;

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
