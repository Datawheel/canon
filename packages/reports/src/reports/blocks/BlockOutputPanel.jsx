/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";

/* components */
import ConsumerMenu from "../components/ConsumerMenu";

/* consts */
import {BLOCK_TYPES} from "../../utils/consts/cms";

/* css */
import "./BlockOutputPanel.css";
import JSONForm from "../editors/JSONForm";

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

  const mode = modeControl.props.value;

  return (
    <div className="cms-block-output">
      {modeControl}
      <div>
        {block.type === BLOCK_TYPES.GENERATOR && apiInput}
        {mode === "code"
          ? <React.Fragment>
            {codeEditor}
            {executeButton}
          </React.Fragment>
          : <JSONForm />
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
