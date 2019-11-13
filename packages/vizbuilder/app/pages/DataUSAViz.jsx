import React, {Component} from "react";
import {Vizbuilder} from "../../src/index";
import * as params from "../params/datausa/viz";

class DataUSAViz extends Component {
  state = {
    intro: this.props.location.search.length < 2
  };

  activate = () => {
    // this.props.router.push("/visualize");
    this.setState({intro: false});
  };

  componentDidMount() {
    console.log("Visualize", "mount");
  }

  componentWillUnmount() {
    console.log("Visualize", "unmount");
  }

  render() {
    return this.state.intro ? (
      <div className="visualize">
        <button onClick={this.activate}>Activate</button>
      </div>
    ) : (
      <div className="visualize">
        <Vizbuilder {...params} />
      </div>
    );
  }
}

export default DataUSAViz;
