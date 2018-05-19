import React from "react";
import PropTypes from "prop-types";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";

import "./AreaLoading.css";

class AreaLoading extends React.Component {
  render() {
    return this.context.loading
      ? <NonIdealState
        className="area-loading"
        title={"loading.title"}
        description={"loading.description"}
        visual={
          <ProgressBar value={this.context.loadDone / this.context.loadTotal} />
        }
      />
      : null;
  }
}

AreaLoading.contextTypes = {
  loading: PropTypes.bool,
  loadTotal: PropTypes.number,
  loadDone: PropTypes.number,
  loadError: PropTypes.any
};

export default AreaLoading;
