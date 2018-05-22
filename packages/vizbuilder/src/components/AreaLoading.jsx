import React from "react";
import {NonIdealState, ProgressBar} from "@blueprintjs/core";

import {loadTypes} from "../state";

import "./AreaLoading.css";

class AreaLoading extends React.Component {
  render() {
    const load = this.context.load;
    return load.inProgress
      ? <NonIdealState
        className="area-loading"
        title={"loading.title"}
        description={"loading.description"}
        visual={<ProgressBar value={load.done / load.total} />}
      />
      : null;
  }
}

AreaLoading.contextTypes = {
  load: loadTypes
};

export default AreaLoading;
