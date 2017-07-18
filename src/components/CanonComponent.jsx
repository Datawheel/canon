import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {LoadingComponent} from "./LoadingComponent";

class CanonComponent extends Component {

  getChildContext() {
    return {
      d3plus: this.props.d3plus || {},
      data: this.props.data || {},
      topics: this.props.topics || []
    };
  }

  render() {
    const {children, loading, loadingComponent} = this.props;
    return loading ? loadingComponent : <div>{ children }</div>;
  }

}

CanonComponent.childContextTypes = {
  data: PropTypes.object,
  d3plus: PropTypes.object,
  topics: PropTypes.array
};

CanonComponent.defaultProps = {
  loadingComponent: <LoadingComponent />
};

CanonComponent = connect(state => ({
  loading: state.loading
}))(CanonComponent);

export {CanonComponent};
