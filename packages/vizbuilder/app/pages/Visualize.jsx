import React, {PropTypes} from "react";

import Vizbuilder from "../../index";
import {DEFAULT_CONFIG, DEFAULT_PERMAKEYS, DEFAULT_TOPOJSON, ENDPOINT} from "./params";

class VisualizePage extends React.Component {
  constructor(props) {
    super(props);

    const {search} = props.location;

    this.state = {
      intro: search.length < 2
    };
  }

  activate() {
    this.props.router.push("/visualize?filters=0-Z1jivMs-4-10000000000&groups=0-HIqzX&measure=Z1jivMs");
    this.setState({intro: false});
  }

  componentDidMount() {
    console.log("Visualize", "mount");
  }

  componentWillUnmount() {
    console.log("Visualize", "unmount");
  }

  render() {
    if (this.state.intro) {
      return (
        <div className="visualize">
          <ul>
            <li><button onClick={this.activate.bind(this)}>Activate</button></li>
          </ul>
        </div>
      );
    }
    return (
      <div className="visualize">
        <Vizbuilder
          config={DEFAULT_CONFIG}
          defaultGroup={["Geography.State"]}
          defaultMeasure={"Millions Of Dollars"}
          measureConfig={{
            "Millions Of Dollars": {colorScaleConfig: {color: "blue"}},
            "Opioid Overdose Death Rate Per 100,000 Age-Adjusted": {
              colorScaleConfig: {color: "red"}
            }
          }}
          reduxKey="map"
          src={ENDPOINT}
          topojson={DEFAULT_TOPOJSON}
        />
      </div>
    );
  }
}

export default VisualizePage
