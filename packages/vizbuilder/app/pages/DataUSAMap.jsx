import React from "react";
import {Vizbuilder} from "../../src";
import * as params from "../params/datausa/map";

function DataUSAMap() {
  return (
    <div className="datausa datausa-map">
      <Vizbuilder {...params} />
    </div>
  );
}

export default DataUSAMap;
