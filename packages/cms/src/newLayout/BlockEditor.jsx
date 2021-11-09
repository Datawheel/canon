import React, {useState, useEffect} from "react";
import {Button, Intent} from "@blueprintjs/core";

import VariableList from "./VariableList";
import BlockInput from "./blocks/BlockInput";
import BlockOutput from "./blocks/BlockOutput";
import BlockSettings from "./blocks/BlockSettings";

import "./BlockEditor.css";

const MODES = {
  INPUT: "input",
  OUTPUT: "output",
  SETTINGS: "settings"
};

const COMPONENTS = {
  [MODES.INPUT]: BlockInput,
  [MODES.OUTPUT]: BlockOutput,
  [MODES.SETTINGS]: BlockSettings
};

/**
 *
 */
function BlockEditor({id, editors}) {

  /* state */
  const [mode, setMode] = useState(MODES.INPUT);

  const BlockPanel = COMPONENTS[mode];

  useEffect(() => {
    console.log("mount");
  }, []);

  return (
    <div className="cms-block-editor">
      <div className="cms-block-editor-toggle">
        <Button onClick={() => setMode(MODES.INPUT)} intent={mode === MODES.INPUT ? Intent.PRIMARY : Intent.NONE} icon="data-lineage">IN</Button>
        <Button onClick={() => setMode(MODES.OUTPUT)}intent={mode === MODES.OUTPUT ? Intent.PRIMARY : Intent.NONE}icon="application">OUT</Button>
        <Button onClick={() => setMode(MODES.SETTINGS)}intent={mode === MODES.SETTINGS ? Intent.PRIMARY : Intent.NONE}icon="cog"></Button>
      </div>
      <div className="cms-block-editor-content">
        <VariableList id={id}/>
        <BlockPanel id={id} editors={editors}/>
      </div>

    </div>
  );

}

export default BlockEditor;
