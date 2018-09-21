import React from "react";
import PropTypes from "prop-types";

class PermalinkManager extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const {router} = this.context;
    const {activeChart, href, keywords, query, onPermalinkUpdate} = this.props;

    const newLocation = router.getCurrentLocation();

    if (href && prevProps.href !== href) {
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
        router.replace(newLocation);
      }
      else {
        router.push(newLocation);
      }
    }
  }

  render() {
    return null;
  }
}

PermalinkManager.contextTypes = {
  router: PropTypes.object
};

PermalinkManager.defaultProps = {
  onPermalinkUpdate: () => null
};

export default PermalinkManager;
