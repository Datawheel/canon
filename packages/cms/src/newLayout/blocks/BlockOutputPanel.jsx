/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Intent} from "@blueprintjs/core";

/* redux */
import {updateEntity} from "../../actions/profiles";

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
function BlockOutput({id, components}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.profiles.entities.blocks[id]);

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
      <div key="buttons">
        <Button onClick={() => changeMode(MODES.TEXT)} intent={mode === MODES.TEXT ? Intent.PRIMARY : Intent.NONE} icon="paragraph"></Button>
        <Button onClick={() => changeMode(MODES.CODE)}intent={mode === MODES.CODE ? Intent.PRIMARY : Intent.NONE}icon="code"></Button>
      </div>
      {mode === MODES.TEXT && components.textEditor}
      {mode === MODES.CODE && components.codeEditor}
      {components.blockPreview}
    </div>
  );

}

export default BlockOutput;
