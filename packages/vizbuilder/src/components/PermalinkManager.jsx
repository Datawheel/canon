import React from "react";
import PropTypes from "prop-types";

import {
  parsePermalink,
  permalinkToState,
  stateToPermalink
} from "../helpers/permalink";
import {isSamePermalinkQuery} from "../helpers/validation";

class PermalinkManager extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const {router, permalinkKeywords} = this.context;
    const {activeChart, href, state} = this.props;

    if (state.load.inProgress) return;

    const location = router.getCurrentLocation();

    const currentPermalinkQuery = location.query;
    const statePermalinkQuery = stateToPermalink(
      permalinkKeywords,
      state.query
    );

    const samePermalinkQuery = isSamePermalinkQuery(
      permalinkKeywords,
      currentPermalinkQuery,
      statePermalinkQuery
    );

    // if there's a difference between the location bar and the internal state
    if (!samePermalinkQuery) {
      // the href attribute changed, trigger a internal state update
      if (prevProps.href !== href) {
        const defaultQuery = parsePermalink(permalinkKeywords, location);
        this.context.loadControl(
          () => permalinkToState(state, defaultQuery),
          this.context.fetchQuery
        );
      }
      // only the internal state changed, trigger a location bar update
      else {
        const newLocation = {
          pathname: location.pathname,
          query: statePermalinkQuery
        };

        if (prevProps.activeChart !== activeChart) {
          router.replace(newLocation);
        }
        else {
          router.push(newLocation);
        }
      }
    }
  }

  render() {
    return null;
  }
}

PermalinkManager.contextTypes = {
  fetchQuery: PropTypes.func,
  loadControl: PropTypes.func,
  permalinkKeywords: PropTypes.object,
  router: PropTypes.object
};

export default PermalinkManager;
