import React, {Component} from "react";
import PropTypes from "prop-types";

class CanonProfile extends Component {

  getChildContext() {
    return {
      topics: this.props.topics || []
    };
  }

  render() {
    const {children} = this.props;
    return <div id="CanonProfile">{ children }</div>;
  }

}

CanonProfile.childContextTypes = {
  topics: PropTypes.array
};

export {CanonProfile};
