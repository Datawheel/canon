import React from "react";
import { NonIdealState, ProgressBar } from "@blueprintjs/core";

import "./AreaLoading.css";

class AreaLoading extends React.Component {
  render() {
    const { progress, total } = this.props;
    const percent = progress / total;

    return percent < 1 ? (
      <NonIdealState
        className="area-loading"
        title={"loading.title"}
        description={"loading.description"}
        visual={<ProgressBar value={percent} />}
      />
    ) : null;
  }
}

export default AreaLoading;
