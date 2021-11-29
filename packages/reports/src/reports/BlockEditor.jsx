/* react */
import React from "react";
import {useSelector} from "react-redux";
import {Tabs, Tab} from "@mantine/core";
import {HiOutlineDocumentText, HiOutlineCog} from "react-icons/hi";

/* components */
import VariableList from "./VariableList";
import BlockOutputPanel from "./blocks/BlockOutputPanel";
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
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

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
            {components.blockSettings}
          </Tab>
        </Tabs>
      </div>
    </div>
  );

}

export default BlockEditor;
