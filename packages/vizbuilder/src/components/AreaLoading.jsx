import React from "react";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";

import "./AreaLoading.css";

function AreaLoading(props) {
  const {inProgress, done, total} = props;
  return inProgress
    ? <NonIdealState
      className="area-loading"
      title={"loading.title"}
      description={"loading.description"}
      visual={<ProgressBar value={done / total} />}
    />
    : null;
}

export default AreaLoading;
