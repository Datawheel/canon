/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@mantine/core";

/* components */
import ConsumerMenu from "../components/ConsumerMenu";

/* redux */
import {updateEntity} from "../../actions/reports";

/* consts */
import {ENTITY_TYPES} from "../../utils/consts/cms";

/* css */
import "./BlockOutputPanel.css";

const MODES = {
  TEXT: "text",
  CODE: "code"
};

/**
 *
 */
function BlockOutputPanel({id, components}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const blocks = useSelector(state => state.cms.reports.entities.blocks);

  const block = blocks[id];

  const [mode, setMode] = useState(block.contentByLocale[localeDefault].content.logicEnabled ? MODES.CODE : MODES.TEXT);

  const changeMode = mode => {
    const payload = {
      id,
      content: [{
        id,
        locale: localeDefault,
        content: {logicEnabled: mode === MODES.CODE}
      }]
    };
    // todo1.0 delay this change, don't save right away
    dispatch(updateEntity(ENTITY_TYPES.BLOCK, payload));
    setMode(mode);
  };

  return (
    <div className="cms-block-output">
      <div key="buttons" style={{display: "flex", flexDirection: "column"}}>
        <Button onClick={() => changeMode(MODES.TEXT)}>Text</Button>
        <Button onClick={() => changeMode(MODES.CODE)}>Code</Button>
      </div>
      {mode === MODES.TEXT && components.textEditor}
      {mode === MODES.CODE && components.codeEditor}
      {components.blockPreview}
      <ConsumerMenu id={id} />
    </div>
  );

}

export default BlockOutputPanel;
