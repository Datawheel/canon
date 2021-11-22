/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Tabs, Tab} from "@mantine/core";
import {HiOutlineDocumentText, HiOutlineCog} from "react-icons/hi";

/* components */
import VariableList from "./VariableList";
import BlockOutputPanel from "./blocks/BlockOutputPanel";
import BlockSettings from "./blocks/BlockSettings";
import GeneratorOutput from "./blocks/GeneratorOutput";
import InputMenu from "./components/InputMenu";

/* css */
import "./BlockEditor.css";
import {BLOCK_TYPES} from "../utils/consts/cms";

/**
 *
 */
function BlockEditor({id, components}) {

  /* redux */
  const blocks = useSelector(state => state.cms.profiles.entities.blocks);
  const block = blocks[id];

  const variables = useMemo(() =>
    Object.values(blocks)
      .filter(d => block.inputs.includes(d.id))
      .reduce((acc, d) => ({...acc, ...d._variables}), {})
  , [blocks]);

  /**
   * The text editor lives in Block.jsx so that its onChange callbacks can be persisted to psql.
   * However, the variables live here in the editor, so that they are only calculated when the editor opens.
   * Add variables as a prop to the text editor "on its way down," so it has access to them.
   * todo1.0 - is this too heavy to do each render?
   */
  components.textEditor = React.cloneElement(components.textEditor, {variables});
  components.blockPreview = React.cloneElement(components.blockPreview, {variables});
  components.apiInput = React.cloneElement(components.apiInput, {variables});

  if (!block) return null;

  return (
    <div className="cms-block-editor">
      <div className="cms-block-editor-content">
        <div style={{display: "flex", flexDirection: "column"}}>
          <InputMenu id={id}/>
          <VariableList id={id}/>
        </div>
        <Tabs>
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
