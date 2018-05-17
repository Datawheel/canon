import React from "react";
import { NonIdealState, ProgressBar } from "@blueprintjs/core";

import "./AreaLoading.css";
import connect from "../store/connect";

class AreaLoading extends React.Component {
  render() {
    const { fetching, total, current } = this.props;

    return fetching ? (
      <NonIdealState
        className="area-loading"
        title={"loading.title"}
        description={"loading.description"}
        visual={<ProgressBar value={current / total} />}
      />
    ) : null;
  }
}

export default connect(AreaLoading);
