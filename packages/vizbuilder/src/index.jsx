import React from "react";

import AreaLoading from "./components/AreaLoading";
import AreaSidebar from "./components/AreaSidebar";
import AreaChart from "./components/AreaChart";
import * as api from './helpers/api';

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
    api.cubes().then(this.itemsCallback)
  }

  itemsCallback = items => {
    this.setState(state => ({ items: { ...state.items, ...items } }));
  };

  queryCallback = query => {
    this.setState(state => ({ query: { ...state.query, ...query } }));
  };

  dataCallback = dataset => {
    this.setState({ dataset });
  };

  render() {
    return (
      <div className="vizbuilder">
        <AreaLoading progress={} total={} />
        <AreaSidebar
          items={this.state.items}
          onQuery={this.queryCallback}
          onItems={this.itemsCallback}
        />
        <AreaChart query={this.state.query} dataset={this.state.dataset} />
      </div>
    );
  }
}

export default Vizbuilder;
