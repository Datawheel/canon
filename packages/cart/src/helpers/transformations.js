import {TYPE_OLAP, TYPE_LOGICLAYER} from "./consts";
import decodeUrl from "form-urldecoded";

/** Java’s String.hashCode() method implemented in Javascript. */
export const getHashCode = s => {
  let h;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
};

/** Parse URL */
export const parseURL = url => {
  const meta = parseQueryParams(url);
  const sanitizedUrl = sanitizeUrl(url);
  const providerObj = getProviderInfo(url);
  return {
    title: getHumanTitle(meta),
    provider: providerObj,
    cube: getCubeName(meta.base),
    meta,
    query: sanitizedUrl
  };
};

/** Sanitize UrL */
export const sanitizeUrl = url => url.replace("aggregate.json?", "aggregate.jsonrecords?");

/** TODO: generate human title from query */
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
  const parts = url.split("/");
  const aggregateIndex = parts.findIndex(p => p.startsWith("aggregate."));
  return aggregateIndex ? parts[aggregateIndex - 1] : null;
};

/** Decide provider based on query */
export const getProviderInfo = url => {
  let server, type;
  if (url.indexOf("/cubes/") > 0) {
    type = TYPE_OLAP;
    server = url.split("/cubes/")[0];
  }
  else {
    type = TYPE_LOGICLAYER;
    server = url.split("/data?")[0];
  }
  return {type, server};
};

/** Prepare Query to Aadd */
export const parseQueryToAdd = (query, logicLayerUrl = false) => {
  const parsed = parseURL(query);
  return {
    id: getHashCode(logicLayerUrl ? logicLayerUrl : query),
    url: parsed.query,
    originalUrl: logicLayerUrl ? logicLayerUrl : query,
    name: parsed.title,
    query: parsed.meta,
    provider: parsed.provider,
    cube: parsed.cube,
    isLoaded: false
  };
};

/** Parse level and dimension */
export const parseLevelDimension = string => {
  const parts = string.split(".").map(s => s.replace("[", "").replace("]", ""));
  if (parts.length > 2) {
    return {dimension: parts[0], level: parts[2]};
  }
  return {dimension: parts[0], level: parts[1]};
};

/** Get level and dimension from Level object */
export const getLevelDimension = level => ({dimension: level.dimension.name, level: level.name});

/** Parse query params */
export const parseQueryParams = url => {
  const parts = url.split("?");

  // Fix mondrian query '&' in values
  let query = decodeURIComponent(parts[1]);
  query = query.replace(/\.&\[/g, ".[");

  const params = decodeUrl(url);

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
  console.log("CUT", params.cut);
  console.log("CUTS", params.cuts);

  return {
    base: parts[0],
    query,
    params
  };
};
