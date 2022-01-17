import React from "react";
import {Vizbuilder} from "../../src";
import * as params from "../params/oec";

function OEC(props) {
  return (
    <div className="oec">
      <Vizbuilder {...params} />
    </div>
  );
}

export default OEC;
