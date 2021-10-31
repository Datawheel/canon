import React, {useState} from "react";
import {Button, Intent} from "@blueprintjs/core";

import VariableList from "./VariableList";
import BlockInputPicker from "./BlockInputPicker";

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
      <div className="cms-block-editor-toggle">
        <Button onClick={() => setMode(MODES.INPUT)} intent={mode === MODES.INPUT ? Intent.PRIMARY : Intent.NONE} icon="data-lineage">IN</Button>
        <Button onClick={() => setMode(MODES.OUTPUT)}intent={mode === MODES.OUTPUT ? Intent.PRIMARY : Intent.NONE}icon="application">OUT</Button>
      </div>
      <div className="cms-block-editor-content">
        <VariableList />
        <BlockInputPicker block={block}/>
      </div>

    </div>
  );

}

export default BlockEditor;
