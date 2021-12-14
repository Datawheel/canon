/* react */
import React from "react";

/* components */
import ConsumerMenu from "../components/ConsumerMenu";

/* hooks */

/* css */
import "./VizOutputPanel.css";

/** */
function VizOutputPanel({id, components}) {

  const {blockPreview, codeEditor, executeButton} = components;

  return (
    <div style={{display: "flex"}}>
      <div className="cms-generator-output">
        {codeEditor}
        {executeButton}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        {blockPreview}
        <ConsumerMenu id={id} />
      </div>
    </div>
  );

}

export default VizOutputPanel;
