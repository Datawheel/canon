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

  const {apiInput, codeEditor, simpleUI, executeButton, blockPreview, modeControl, textEditor} = components;

  const mode = modeControl.props.value;

  const isStatlike = ![BLOCK_TYPES.GENERATOR, BLOCK_TYPES.VIZ, BLOCK_TYPES.SELECTOR].includes(block.type);

  return (
    <div className="cms-block-output">
      {modeControl}
      <div>
        {mode === "code"
          ? <React.Fragment>
            {apiInput}
            {codeEditor}
            {executeButton}
          </React.Fragment>
          : isStatlike
            ? textEditor
            : simpleUI
        }
      </div>
      <div style={{display: "flex", flexDirection: "column"}}>
        {blockPreview}
        <ConsumerMenu id={id} />
      </div>
    </div>
  );

}

export default BlockOutputPanel;
