import React, {useState} from "react";
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

/**
 *
 */
function BlockEditor({block}) {

  /* state */
  const [mode, setMode] = useState(MODES.INPUT);

  const COMPONENTS = {
    [MODES.INPUT]: BlockInput,
    [MODES.OUTPUT]: BlockOutput,
    [MODES.SETTINGS]: BlockSettings
  };

  const BlockPanel = COMPONENTS[mode];

  return (
    <div className="cms-block-editor">
      <div className="cms-block-editor-toggle">
        <Button onClick={() => setMode(MODES.INPUT)} intent={mode === MODES.INPUT ? Intent.PRIMARY : Intent.NONE} icon="data-lineage">IN</Button>
        <Button onClick={() => setMode(MODES.OUTPUT)}intent={mode === MODES.OUTPUT ? Intent.PRIMARY : Intent.NONE}icon="application">OUT</Button>
        <Button onClick={() => setMode(MODES.SETTINGS)}intent={mode === MODES.SETTINGS ? Intent.PRIMARY : Intent.NONE}icon="cog"></Button>
      </div>
      <div className="cms-block-editor-content">
        <VariableList />
        <BlockPanel block={block} />
      </div>

    </div>
  );

}

export default BlockEditor;
