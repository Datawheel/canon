import { Query } from "mondrian-rest-client";

/**
 * @typedef VizQuery
 * @prop {string} cube
 */

function setCaptionForLevelAndLang(query, level, lang) {
  const ann = level.annotations[`${lang}_caption`];
  if (ann) {
    query.caption(level.hierarchy.dimension.name, level.name, ann);
  }
  return query;
}

function setLangCaptions(query, lang) {
  const drilldowns = query.getDrilldowns() || [];
  drilldowns.forEach(level => {
    query = setCaptionForLevelAndLang(query, level, lang);

    // when parents requested, also get their i18n'd captions
    if (query.options["parents"]) {
      rangeRight(1, level.depth).forEach(d => {
        const ancestor = level.hierarchy.levels.find(l => l.depth === d);
        query = setCaptionForLevelAndLang(query, ancestor, lang);
      });
    }
  });
  return query;
}

/**
 * @param {Query} query
 * @param {VizQuery} params
 * @returns {Query}
 */
export function queryBuilder(query, params) {
  let i, item;

  for (i = 0; (item = params.measures[i]); i++) {
    query = query.measure(item);
  }

  for (i = 0; (item = params.drillDowns[i]); i++) {
    query = query.drilldown.apply(query, item);
  }

  for (i = 0; (item = params.cuts[i]); i++) {
    if ("string" != typeof item) {
      item = item.values.map(v => `${item.key}.&[${v}]`).join(",");
      if (item.indexOf("],[") > -1) item = "{" + item + "}";
    }
    query = query.cut(item);
  }

  for (i = 0; (item = params.filters[i]); i++) {
    query = query.filter.apply(query, item);
  }

  if (params.limit) {
    query = query.pagination(params.limit, params.offset);
  }

  if (params.order) {
    query = query.sorting(params.order, params.orderDesc);
  }

  for (item in params.options) {
    query = query.option(item, params.options[item]);
  }

  return query; // setLangCaptions(query, params.locale);
}

export function quickQuery(params) {
  if (!params.cube)
    throw new Error("Invalid query: No 'cube' property defined.");

  params = Object.assign(
    {
      measures: [],
      drillDowns: [],
      cuts: [],
      options: {},
      locale: "en",
      limit: undefined,
      offset: undefined,
      order: undefined,
      orderDesc: undefined
    },
    params
  );

  return client.cube(params.cube).then(cube => {
    const query = queryBuilder(cube.query, params);
    return client.query(query, params.format || "json");
  });
}
