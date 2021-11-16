/* react */
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {Button} from "@mantine/core";
import {HiViewGridAdd, HiOutlineDocumentText, HiOutlineCog} from "react-icons/hi";

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
        <Button onClick={() => setMode(MODES.INPUT)} variant={mode === MODES.INPUT ? "filled" : "outline"} leftIcon={<HiViewGridAdd size={20}/>}>IN</Button>
        <Button onClick={() => setMode(MODES.OUTPUT)} variant={mode === MODES.OUTPUT ? "filled" : "outline"} leftIcon={<HiOutlineDocumentText size={20}/>}>OUT</Button>
        <Button onClick={() => setMode(MODES.SETTINGS)} variant={mode === MODES.SETTINGS ? "filled" : "outline"} leftIcon={<HiOutlineCog size={20}/>}></Button>
      </div>
      <div className="cms-block-editor-content">
        <VariableList variables={variables}/>
        <BlockPanel id={id} components={components} />
      </div>

    </div>
  );

}

export default BlockEditor;
