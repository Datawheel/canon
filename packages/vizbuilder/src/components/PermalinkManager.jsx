import React from "react";
import queryString from "query-string";
import {browserHistory} from "react-router";

class PermalinkManager extends React.PureComponent {
  componentDidUpdate() {
    const {keywords, query, activeType} = this.props;

    browserHistory.push({
      ...browserHistory.getCurrentLocation(),
      query: {
        [keywords.measure]: query.measure.annotations._key,
        [keywords.dimension]: query.dimension.annotations._key,
        [keywords.level]: query.drilldown.annotations._key,
        [keywords.enlarged]: activeType || undefined
      }
    });
  }

  render() {
    return null;
  }
}

/**
 * Parses the current `locationSearch` using the `keywords` defined by the user, and
 * returns the result in an object. This object can also be optionally passed as `target`.
 * @template T
 * @param {Location} location A location search parameter string
 * @param {object} keywords A map with the parameter keys to parse from the location search
 * @param {T} [target] The object where the parsed parameters are going to be saved
 * @returns {T}
 */
export function parsePermalink(location, keywords, target) {
  const locationQuery = location.query || queryString.parse(location.search) || {};

  return Object.keys(keywords).reduce(
    (query, key) => {
      const assignedKey = keywords[key];
      query[key] = locationQuery[assignedKey];
      return query;
    },
    target || {}
  );
}

export default PermalinkManager;
