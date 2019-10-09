import React from "react";
import {Vizbuilder} from "../../src";
import * as params from "../newparams";

function tableLogic(cubes, query) {
  return cubes.find(d => d.name.includes("_5")) || cubes[0];
}

function NewVizbuilder(props) {
  return (
    <div className="visualize">
      <Vizbuilder {...params} />
    </div>
  );
}

export default NewVizbuilder;
