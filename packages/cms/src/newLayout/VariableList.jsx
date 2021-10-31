import React, {useState} from "react";
import {Button, Intent} from "@blueprintjs/core";

import "./VariableList.css";

const MODES = {
  INPUT: "input",
  OUTPUT: "output"
};

/**
 *
 */
function VariableList({variables = {}}) {

  for (let i = 0; i < 200; i++) {
    variables[`variable${i}`] = Math.random();
  }

  return (
    <div className="cms-block-variable-list">
      <ul>
        {Object.keys(variables).map(d => <li key={d}>{`${d}: ${variables[d]}`}</li>)}
      </ul>
    </div>
  );

}

export default VariableList;
