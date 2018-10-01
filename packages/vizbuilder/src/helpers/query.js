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
  // TODO: add "metaqueries"
  return params.groups.filter(isValidGrouping).map(grouping => ({
    ...params,
    level: grouping.level,
    cuts: grouping.hasMembers && {
      key: grouping.level.fullName,
      values: grouping.members
    }
  }));
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

  const drilldowns = [params.level, params.timeLevel]
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
    query = query.measure(params.measures[i]);
  }

  item = params.drilldowns.length;
  for (i = 0; i < item; i++) {
    query = query.drilldown(...params.drilldowns[i]);
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

    query = query.cut(item);
  }

  item = params.filters.length;
  for (i = 0; i < item; i++) {
    query = query.filter(...params.filters[i]);
  }

  if (params.limit) {
    query = query.pagination(params.limit, params.offset);
  }

  if (params.order) {
    query = query.sorting(params.order, params.orderDesc);
  }

  for (item in params.options) {
    if (params.options.hasOwnProperty(item)) {
      query = query.option(item, params.options[item]);
    }
  }

  return query; // setLangCaptions(query, params.locale);
}
