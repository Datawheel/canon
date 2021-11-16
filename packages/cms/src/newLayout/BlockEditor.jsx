/* react */
import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {Button, Intent} from "@blueprintjs/core";

/* components */
import VariableList from "./VariableList";
import BlockInput from "./blocks/BlockInput";
import BlockOutput from "./blocks/BlockOutput";
import BlockSettings from "./blocks/BlockSettings";
import GeneratorOutput from "./blocks/GeneratorOutput";

/* css */
import "./BlockEditor.css";
import {BLOCK_TYPES} from "../utils/consts/cms";

const MODES = {
  INPUT: "input",
  OUTPUT: "output",
  SETTINGS: "settings"
};

/**
 *
 */
function BlockEditor({id, components}) {

  /* redux */
  const {block, variables} = useSelector(state => {
    const block = state.cms.profiles.entities.blocks[id];
    const blocks = Object.values(state.cms.profiles.entities.blocks);
    const inputs = blocks.filter(d => block.inputs.includes(d.id));
    const variables = inputs.reduce((acc, d) => ({...acc, ...d._variables}), {});
    return {block, variables};
  });

  if (!block) return null;

  const COMPONENTS = {
    [MODES.INPUT]: BlockInput,
    [MODES.OUTPUT]: block.type === BLOCK_TYPES.GENERATOR ? GeneratorOutput : BlockOutput,
    [MODES.SETTINGS]: BlockSettings
  };

  /* state */
  const [mode, setMode] = useState(MODES.OUTPUT);

  const BlockPanel = COMPONENTS[mode];

  useEffect(() => {
    //
  }, []);

  /**
   * The text editor lives in Block.jsx so that its onChange callbacks can be persisted to psql.
   * However, the variables live here in the editor, so that they are only calculated when the editor opens.
   * Add variables as a prop to the text editor "on its way down," so it has access to them.
   * todo1.0 - is this too heavy to do each render?
   */
  components.textEditor = React.cloneElement(components.textEditor, {variables});
  components.blockPreview = React.cloneElement(components.blockPreview, {variables});

  return (
    <div className="cms-block-editor">
      <div className="cms-block-editor-toggle">
        <Button onClick={() => setMode(MODES.INPUT)} intent={mode === MODES.INPUT ? Intent.PRIMARY : Intent.NONE} icon="data-lineage">IN</Button>
        <Button onClick={() => setMode(MODES.OUTPUT)}intent={mode === MODES.OUTPUT ? Intent.PRIMARY : Intent.NONE}icon="application">OUT</Button>
        <Button onClick={() => setMode(MODES.SETTINGS)}intent={mode === MODES.SETTINGS ? Intent.PRIMARY : Intent.NONE}icon="cog"></Button>
      </div>
      <div className="cms-block-editor-content">
        <VariableList variables={variables}/>
        <BlockPanel id={id} components={components} />
      </div>

    </div>
  );

}

export default BlockEditor;
