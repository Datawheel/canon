import React from "react";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";

import "./AreaLoading.css";

class AreaLoading extends React.Component {
  render() {
    const {inProgress, done, total} = this.props;
    return inProgress
      ? <NonIdealState
        className="area-loading"
        title={"loading.title"}
        description={"loading.description"}
        visual={<ProgressBar value={done / total} />}
      />
      : null;
  }
}

export default AreaLoading;
