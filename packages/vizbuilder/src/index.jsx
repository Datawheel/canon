import React from "react";

import AreaLoading from "./components/AreaLoading";
import AreaSidebar from "./components/AreaSidebar";
import AreaChart from "./components/AreaChart";
import { initClient } from "./helpers/api";
import store from "./store";
import connect from "./store/connect";

import "./index.css";

class Vizbuilder extends React.PureComponent {
  constructor(props) {
    super(props);
    initClient(props.src);
  }

  componentDidMount() {
    store.setState({
      dataset: [
        { parent: "Group 1", id: "alpha", value: 29 },
        { parent: "Group 1", id: "beta", value: 10 },
        { parent: "Group 1", id: "gamma", value: 2 },
        { parent: "Group 2", id: "delta", value: 29 },
        { parent: "Group 2", id: "eta", value: 25 }
      ]
    });
  }

  render() {
    return (
      <div className="vizbuilder">
        <AreaLoading />
        <AreaSidebar />
        <AreaChart query={this.props.query} dataset={this.props.dataset} />
      </div>
    );
  }
}

export default connect(Vizbuilder);
