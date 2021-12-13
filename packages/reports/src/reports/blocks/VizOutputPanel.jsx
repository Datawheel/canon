/* react */
import React from "react";

/* components */
import ConsumerMenu from "../components/ConsumerMenu";

/* hooks */

/* css */
import "./VizOutputPanel.css";

/**
 * When a block adds an API call as an input, the user will see this panel,
 * which includes the ability to add inputs, supply an API, and process the results.
 * In actuality, the user is creating a Generator Block which is just like any other block,
 * and subscribing to it as an input. However, to help hide the generators, this inline editor
 * handles everything inline, in one panel, and generators are then hidden from the user.
 */
function VizOutputPanel({id, components}) {

  const {codeEditor, executeButton, vizPreview} = components;

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {codeEditor}
        {executeButton}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        {vizPreview}
        <ConsumerMenu id={id} />
      </div>
    </div>
  );

}

export default VizOutputPanel;
