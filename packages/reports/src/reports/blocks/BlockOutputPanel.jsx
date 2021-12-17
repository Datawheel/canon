/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";

/* components */
import ConsumerMenu from "../components/ConsumerMenu";

/* consts */
import {BLOCK_TYPES} from "../../utils/consts/cms";

/* css */
import "./BlockOutputPanel.css";

/**
 *
 */
function BlockOutputPanel({id, components}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const blocks = useSelector(state => state.cms.reports.entities.blocks);

  const block = blocks[id];

  const {apiInput, codeEditor, textEditor, executeButton, blockPreview, modeControl} = components;

  return (
    <div className="cms-block-output">
      {modeControl}
      <div>
        {/* todo 1.0 fix all this horrible routing. these will be switched between ui/text when the UI EZmodes are complete */}
        {block.type === BLOCK_TYPES.GENERATOR && apiInput}
        {/* ![BLOCK_TYPES.GENERATOR, BLOCK_TYPES.SELECTOR, BLOCK_TYPES.VIZ].includes(block.type) && textEditor */}
        {codeEditor}
        {executeButton}
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        {blockPreview}
        <ConsumerMenu id={id} />
      </div>
    </div>
  );

}

export default BlockOutputPanel;
