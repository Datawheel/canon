import React from "react";
import {browserHistory} from "react-router";

class PermalinkManager extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const {activeChart, href, keywords, query, onPermalinkUpdate} = this.props;
    const newLocation = browserHistory.getCurrentLocation();

    if (prevProps.href !== href) {
      newLocation.query[keywords.enlarged] = activeChart || undefined;
      onPermalinkUpdate(newLocation);
    }
    else {
      newLocation.query = {
        [keywords.measure]: query.measure.annotations._key,
        [keywords.dimension]: query.dimension.annotations._key,
        [keywords.level]: query.drilldown.annotations._key,
        [keywords.enlarged]: activeChart || undefined
      };

      if (prevProps.activeChart !== activeChart) {
        browserHistory.replace(newLocation);
      }
      else {
        browserHistory.push(newLocation);
      }
    }
  }

  render() {
    return null;
  }
}

PermalinkManager.defaultProps = {
  onPermalinkUpdate: () => null
};

export default PermalinkManager;
