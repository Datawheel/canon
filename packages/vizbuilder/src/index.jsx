import React from "react";

import AreaSidebar from "./components/AreaSidebar";
import AreaChart from "./components/AreaChart";

import LOADINGSTATE from "./helpers/loading";

import "./index.css";

class Vizbuilder extends React.PureComponent {
  state = {
    loadingState: LOADINGSTATE.EMPTY,
    members: {
      cubes: []
    },
    query: {},
    dataset: [
      { parent: "Group 1", id: "alpha", value: 29 },
      { parent: "Group 1", id: "beta", value: 10 },
      { parent: "Group 1", id: "gamma", value: 2 },
      { parent: "Group 2", id: "delta", value: 29 },
      { parent: "Group 2", id: "eta", value: 25 }
    ]
  };

  constructor(props) {
    super(props);
  }

  membersCallback = options => {
    this.setState({ options });
  };

  queryCallback = query => {
    this.setState({ query });
  };

  dataCallback = dataset => {
    this.setState({ dataset });
  };

  render() {
    return (
      <div className="vizbuilder">
        <AreaSidebar onChange={this.queryCallback} />
        <AreaChart dataset={this.state.dataset} />
      </div>
    );
  }
}

export default Vizbuilder;
