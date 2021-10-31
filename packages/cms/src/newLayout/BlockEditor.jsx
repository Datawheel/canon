import React, {useState} from "react";
import {Button, Intent} from "@blueprintjs/core";

import VariableList from "./VariableList";

import "./BlockEditor.css";


const MODES = {
  INPUT: "input",
  OUTPUT: "output"
};

/**
 *
 */
function BlockEditor({block}) {

  /* state */
  const [mode, setMode] = useState(MODES.INPUT);

  return (
    <div className="cms-block-editor">
      <VariableList />
      <div className="cms-block-editor-toggle">
        <Button onClick={() => setMode(MODES.INPUT)} intent={mode === MODES.INPUT ? Intent.PRIMARY : Intent.NONE} icon="data-lineage">IN</Button>
        <Button onClick={() => setMode(MODES.OUTPUT)}intent={mode === MODES.OUTPUT ? Intent.PRIMARY : Intent.NONE}icon="application">OUT</Button>
      </div>
    </div>
  );

}

export default BlockEditor;
