/* react */
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {Tabs, Tab} from "@mantine/core";
import {HiViewGridAdd, HiOutlineDocumentText, HiOutlineCog} from "react-icons/hi";

/* components */
import VariableList from "./VariableList";
import BlockInputPanel from "./blocks/BlockInputPanel";
import BlockOutputPanel from "./blocks/BlockOutputPanel";
import BlockSettings from "./blocks/BlockSettings";
import GeneratorOutput from "./blocks/GeneratorOutput";

/* css */
import "./BlockEditor.css";
import {BLOCK_TYPES} from "../utils/consts/cms";

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
      <div className="cms-block-editor-content">
        <VariableList variables={variables}/>
        <Tabs>
          <Tab icon={<HiViewGridAdd />} label="Input">
            <BlockInputPanel id={id} components={components} />
          </Tab>
          <Tab icon={<HiOutlineDocumentText />} label="Output">
            {block.type === BLOCK_TYPES.GENERATOR ? <GeneratorOutput id={id} components={components} /> : <BlockOutputPanel id={id} components={components} />}
          </Tab>
          <Tab icon={<HiOutlineCog />} label="Settings">
            <BlockSettings />
          </Tab>
        </Tabs>
      </div>
    </div>
  );

}

export default BlockEditor;
