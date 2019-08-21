import {TYPE_OLAP, TYPE_LOGICLAYER} from "./consts";

/** Java’s String.hashCode() method implemented in Javascript. */
export const getHashCode = s => {
  let h;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
};

/** TODO: generate human title from query */
export const parseURL = url => {
  const meta = parseQueryParams(url);
  const sanitizedUrl = sanitizeUrl(url, meta);
  return {
    title: getHumanTitle(meta),
    provider: getProviderInfo(url),
    cube: getCubeName(meta.base),
    meta,
    query: sanitizedUrl
  };
};

/** Sanitize UrL */
export const sanitizeUrl = (url, meta) => url.replace("aggregate.json?", "aggregate.jsonrecords?");

/** TODO: generate human title from query */
export const getHumanTitle = meta => {
  const title = meta.params.measure ? meta.params.measure[0] : meta.params.measures[0];
  return title;
};

/** TODO: generate human title from query */
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
    server = url.split("?")[0];
  }
  return {type, server};
};

/** Parse query params */
export const parseQueryParams = url => {
  let [base, query] = url.split("?");

  // Fix mondrian query '&' in values
  query = decodeURIComponent(query);
  query = query.replace(/\.&\[/g, "|||");

  // Parans
  const params = query.split("&")
    .reduce((obj, d) => {
      let [key, val] = d.split("=");

      // Custom fix mondrian query []
      key = key.replace(/\[\]/g, "");
      val = val.replace(/\|\|\|/g, ".&[").replace(/\+/g, " ");

      if (val) {
        obj[key] = val
          .split(/\,([A-z])/g)
          .reduce((arr, d) => {
            if (arr.length && arr[arr.length - 1].length === 1) arr[arr.length - 1] += d;
            else if (d.length) arr.push(d);
            return arr;
          }, []);
      }
      else {
        console.error("BAD key value:", key, val);
      }
      return obj;
    }, {});

  return {
    base,
    query,
    params
  };
};
