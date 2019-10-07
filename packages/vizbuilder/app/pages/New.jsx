import React from "react";
import {Vizbuilder} from "../../src";
import {
  ENDPOINT_DEFAULT,
  TOPOJSON_DEFAULT,
  VISUALIZE_CONFIG_DEFAULT,
  VISUALIZE_GROUPS_DEFAULT,
  VISUALIZE_MEASURE_DEFAULT
} from "../params";

function tableLogic(cubes, query) {
  return cubes.find(d => d.name.includes("_5")) || cubes[0];
}

function NewVizbuilder(props) {
  return (
    <div className="visualize">
      <Vizbuilder
        config={VISUALIZE_CONFIG_DEFAULT}
        defaultGroup={VISUALIZE_GROUPS_DEFAULT}
        defaultMeasure={VISUALIZE_MEASURE_DEFAULT}
        src={ENDPOINT_DEFAULT}
        tableLogic={tableLogic}
        topojson={TOPOJSON_DEFAULT}
      />
    </div>
  );
}

export default NewVizbuilder;
