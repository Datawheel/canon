/* react */
import React from "react";
import {useSelector} from "react-redux";
import {Tabs, Tab} from "@mantine/core";
import {HiOutlineDocumentText, HiOutlineCog} from "react-icons/hi";

/* components */
import VariableList from "./VariableList";
import BlockOutputPanel from "./blocks/BlockOutputPanel";
import GeneratorOutput from "./blocks/GeneratorOutput";
import VizOutput from "./blocks/VizOutput";
import InputMenu from "./components/InputMenu";

/* enums */
import {BLOCK_TYPES} from "../utils/consts/cms";

/* css */
import "./BlockEditor.css";

/**
 *
 */
function BlockEditor({id, components}) {

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  if (!block) return null;

  const panels = {
    [BLOCK_TYPES.GENERATOR]: GeneratorOutput,
    [BLOCK_TYPES.VIZ]: VizOutput
  };
  const Panel = panels[block.type] || BlockOutputPanel;

  return (
    <div className="cms-block-editor">
      <div className="cms-block-editor-content">
        <div style={{display: "flex", flexDirection: "column"}}>
          <InputMenu id={id}/>
          <VariableList id={id}/>
        </div>
        <Tabs>
          <Tab icon={<HiOutlineDocumentText />} label="Output">
            <Panel id={id} components={components} />
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
