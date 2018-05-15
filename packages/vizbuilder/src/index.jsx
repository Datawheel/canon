import React from "react";

import AreaSidebar from "./components/AreaSidebar";
import AreaChart from "./components/AreaChart";

import LOADINGSTATE from "./helpers/loading";

class Vizbuilder extends React.PureComponent {
  state = {
    loadingState: LOADINGSTATE.EMPTY,
    members: {
      cubes: []
    },
    query: {},
    dataset: []
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
