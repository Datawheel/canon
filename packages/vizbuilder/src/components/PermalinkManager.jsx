import React from "react";
import queryString from "query-string";
import {browserHistory} from "react-router";

class PermalinkManager extends React.PureComponent {
  static parsePermalink = parsePermalink;

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

export function parsePermalink(location, keywords, defaults) {
  const locationQuery = queryString.parse(location) || {};

  return Object.keys(keywords).reduce(
    (query, key) => {
      const assignedKey = keywords[key];
      query[key] = locationQuery[assignedKey];
      return query;
    },
    defaults || {}
  );
}

export default PermalinkManager;
