import React, {useState} from "react";
import {Button, Intent} from "@blueprintjs/core";

import "./VariableList.css";

/**
 *
 */
function VariableList({variables}) {

  return (
    <div className="cms-block-variable-list">
      <ul>
        {Object.keys(variables).map(d => <li key={d}>{`${d}: ${variables[d]}`}</li>)}
      </ul>
    </div>
  );

}

export default VariableList;
