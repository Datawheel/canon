import React, {useState} from "react";
import {Button, Intent} from "@blueprintjs/core";

import "./BlockPreview.css";

/**
 *
 */
function BlockPreview({id}) {

  return (
    <div className="cms-block-preview">
      block preview of {id}
    </div>
  );

}

export default BlockPreview;
