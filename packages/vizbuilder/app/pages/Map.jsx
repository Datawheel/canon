import React from "react";

import Vizbuilder from "../../index";
import {DEFAULT_CONFIG, DEFAULT_PERMAKEYS, DEFAULT_TOPOJSON, ENDPOINT} from "./params";

export default class MapPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="site-wrapper">
        <Vizbuilder
          src={ENDPOINT}
          reduxKey="map"
          visualizations={["geomap"]}
        />
      </div>
    );
  }
}
