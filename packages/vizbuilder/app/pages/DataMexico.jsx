import React from "react";
import {Vizbuilder} from "../../src";
import * as params from "../params/datamexico";

function DataMexico(props) {
  return (
    <div className="datamexico">
      <Vizbuilder
        {...params}
        titleArea={
          <img
            style={{maxWidth: "100%"}}
            src="https://placehold.co/300x50?text=titleArea"
          />
        }
        controlsArea={
          <img
            style={{maxWidth: "100%"}}
            src="https://placehold.co/300x50?text=controlsArea"
          />
        }
        sourcesArea={
          <img
            style={{maxWidth: "100%"}}
            src="https://placehold.co/300x50?text=sourcesArea"
          />
        }
        toolbarArea={
          <img
            style={{maxWidth: "100%"}}
            src="https://placehold.co/1200x50?text=toolbarArea"
          />
        }
      />
    </div>
  );
}

export default DataMexico;
