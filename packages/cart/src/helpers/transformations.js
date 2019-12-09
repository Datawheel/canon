import {TYPE_OLAP, TYPE_LOGICLAYER, TYPE_CANON_STATS} from "./consts";
import decodeUrl from "form-urldecoded";

/** Prepare Query to Add */
export const getQueryParsedToAdd = (query, logicLayerUrl = false) => {
  const meta = parseQueryParams(query);

  return {
    id: getHashCode(logicLayerUrl ? logicLayerUrl : query),
    url: sanitizeUrl(query),
    originalUrl: logicLayerUrl ? logicLayerUrl : query,
    name: getHumanTitle(meta),
    query: meta,
    provider: getProviderInfo(query),
    cube: getCubeName(query),
    isLoaded: false
  };
};


/** SMALL HELPERS HERE  */

/** Java’s String.hashCode() method implemented in Javascript. */
export const getHashCode = s => {
  let h;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
};

/** Sanitize UrL */
export const sanitizeUrl = url => url.replace("aggregate.json?", "aggregate.jsonrecords?");

/** Generate human title from query */
export const getHumanTitle = meta => {
  let title = meta.params.measure ? meta.params.measure[0] : meta.params.measures[0];
  if (meta.params.drilldowns) {
    meta.params.drilldowns.map(d => {
      title += ` by ${d.dimension}`;
    });
  }
  return title;
};

/** Parse cube name */
export const getCubeName = url => {
  const provider = getProviderInfo(url);
  let cubeName = "";
  switch (provider.type) {
    case TYPE_OLAP:
      const parts = url.split("/");
      const aggregateIndex = parts.findIndex(p => p.startsWith("aggregate."));
      cubeName = aggregateIndex ? parts[aggregateIndex - 1] : null;
      break;
    case TYPE_LOGICLAYER:
      const params = decodeUrl(url);
      cubeName = params.cube;
      break;
    default:
      cubeName = "";
      break;
  }
  return cubeName;
};

/** Decide provider based on query */
export const getProviderInfo = url => {
  let server, type;
  if (url.indexOf("/cubes/") > 0) {
    type = TYPE_OLAP;
    server = url.split("/cubes/")[0];
  }
  else if (url.indexOf("/data?") > 0) {
    type = TYPE_LOGICLAYER;
    server = url.split("/data?")[0];
  }
  else if (url.indexOf("/api/stats/") > 0) {
    type = TYPE_CANON_STATS;
    server = url.split("/api/stats/")[0];
  }
  else {
    console.warn(`getProviderInfo -> Ignoring ${url}`);
    type = null;
    server = url;
  }
  return {type, server};
};

/** Parse level and dimension */
export const parseLevelDimension = string => {
  const parts = string.split(".").map(s => s.replace("[", "").replace("]", ""));
  if (parts.length > 2) {
    return {dimension: parts[0], level: parts[2]};
  }
  return {dimension: parts[0], level: parts[1]};
};

/** Parse cuts */
export const parseCut = string => {
  const levelDimension = parseLevelDimension(string);
  let value = string.split(".").map(s => s.replace("[", "").replace("]", "").replace("&", ""));
  value = value[value.length - 1];
  return {...levelDimension, value};
};

/** Get level and dimension from Level object */
export const getLevelDimension = level => ({dimension: level.dimension.name, level: level.name});

/** Parse query params */
export const parseQueryParams = url => {
  const parts = url.split("?");

  // Fix mondrian query '&' in values
  let query = decodeURIComponent(parts[1]);
  query = query.replace(/\.&\[/g, ".[");

  const params = decodeUrl(query);

  // Drilldowns
  if (params.drilldown) {
    params.drilldowns = Array.isArray(params.drilldown) ? params.drilldown : params.drilldown.split(",");
    params.drilldown = params.drilldowns;
  }
  if (params.drilldowns) {
    params.drilldowns = Array.isArray(params.drilldowns) ? params.drilldowns : params.drilldowns.split(",");
    params.drilldowns = params.drilldowns.map(d => parseLevelDimension(d));
  }

  // Measures
  if (params.measure) {
    params.measures = Array.isArray(params.measures) ? params.measures : params.measures.split(",");
    params.measure = params.measures;
  }
  params.measures = Array.isArray(params.measures) ? params.measures : params.measures.split(",");

  // Cuts
  if (params.cut) {
    params.cuts = Array.isArray(params.cut) ? params.cut : params.cut.split(",");
    params.cut = params.cuts;
  }
  params.cuts = Array.isArray(params.cuts) ? params.cuts.map(d => parseCut(d)) : [];

  return {
    base: parts[0],
    query,
    params
  };
};
