import React from "react";
import {Vizbuilder} from "../../src";
import * as params from "../params/chilecracia";

function Chilecracia(props) {
  return (
    <div className="chilecracia">
      <Vizbuilder
        {...params}
      />
    </div>
  );
}

export default Chilecracia;
