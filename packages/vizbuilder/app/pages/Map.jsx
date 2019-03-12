import React from "react";

import Vizbuilder from "../../index";
import {
  DEFAULT_CONFIG,
  DEFAULT_PERMAKEYS,
  DEFAULT_TOPOJSON,
  ENDPOINT,
  colorScaleConfig
} from "./params";

export default class MapPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="site-wrapper">
        <Vizbuilder
          src={ENDPOINT}
          topojson={DEFAULT_TOPOJSON}
          defaultGroup={[
            "Geography.County",
            "Geography.County.State",
            "Origin State.Origin State"
          ]}
          defaultMeasure="Uninsured"
          config={{
            colorScaleConfig,
            colorScalePosition: "bottom",
            fitObject: "/topojson/State.json",
            fitFilter: d =>
              !["02", "15", "43", "60", "66", "69", "72", "78"].includes(d.id.slice(7)),
            shapeConfig: {
              hoverOpacity: 1
            },
            title: false,
            zoomScroll: true
          }}
          instanceKey="map"
          visualizations={["geomap"]}
        />
      </div>
    );
  }
}
