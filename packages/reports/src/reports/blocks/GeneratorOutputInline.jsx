/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import deepClone from "../../utils/js/deepClone";
import {Button} from "@mantine/core";

import AceWrapper from "../editors/AceWrapper";

/* css */
import "./GeneratorOutputInline.css";
import {updateEntity} from "../../actions/reports";
import {BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";

/**
 * When a block adds an API call as an input, the user will see this panel,
 * which includes the ability to add inputs, supply an API, and process the results.
 * In actuality, the user is creating a Generator Block which is just like any other block,
 * and subscribing to it as an input. However, to help hide the generators, this inline editor
 * handles everything inline, in one panel, and generators are then hidden from the user.
 */
function GeneratorOutputInline({id, onClose}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.reports.entities.blocks[id]);

  const [blockState, setBlockState] = useState(deepClone(block));

  const onChangeCode = logic => {
    setBlockState({...blockState, content: {...blockState.content, logic}});
  };

  const onSave = () => {
    const payload = {
      id,
      content: {...block.content, logic: blockState.content.logic}
    };
    dispatch(updateEntity(ENTITY_TYPES.BLOCK, payload));
    // todo1.0 wait for confirmation
    onClose();
  };

  return (
    <div className="cms-generator-output-inline">
      <AceWrapper
        style={{flex: 1, width: 500, height: 500}}
        key="code-editor"
        onChange={onChangeCode}
        value={blockState.content.logic}
      />
      <Button onClick={onSave}>Save</Button>
    </div>
  );

}

export default GeneratorOutputInline;
