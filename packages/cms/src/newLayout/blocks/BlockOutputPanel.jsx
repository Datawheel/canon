/* react */
import React, {useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ThemeIcon, Button, Menu} from "@mantine/core";
import {HiViewGridAdd, HiCheckCircle} from "react-icons/hi";

/* components */
import InputMenuItem from "../components/InputMenuItem";

/* redux */
import {newEntity, deleteEntity, updateEntity} from "../../actions/profiles";

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
  const blocks = useSelector(state => state.cms.profiles.entities.blocks);

  const block = blocks[id];
  const inputs = useSelector(state => state.cms.profiles.entities.inputs);
  const inputBlocks = useMemo(() => Object.values(inputs).filter(d => block.inputs.includes(d.id)).reduce((acc, d) => ({...acc, [d.id]: d}), {}), [inputs]);

  const sectionBlocks = useMemo(() => Object.values(blocks).filter(d => d.section_id === block.section_id), [blocks]);
  const sourceBlocks = useMemo(() => Object.values(sectionBlocks).filter(d => d.id !== block.id), [sectionBlocks]);
  const variables = useMemo(() => Object.values(blocks).reduce((acc, d) => ({...acc, [d.id]: d._variables}), {}), [blocks]);

  const handleClick = id => {
    if (inputBlocks[id]) {
      dispatch(deleteEntity(ENTITY_TYPES.BLOCK_INPUT, {id: inputBlocks[id].block_input.id}));
    }
    else {
      dispatch(newEntity(ENTITY_TYPES.BLOCK_INPUT, {input_id: Number(id), block_id: block.id}));
    }
  };

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
      <Menu zIndex={1001} control={<Button variant="outline" style={{position: "absolute", top: -40, left: 0}} leftIcon={<HiViewGridAdd />}>Choose Inputs</Button>}>
        {sourceBlocks.map(({id}) =>
          <Menu.Item onClick={() => handleClick(id)} icon={block.inputs.includes(id) ? <ThemeIcon size="xs" radius="xl" color="green"><HiCheckCircle /></ThemeIcon> : null} key={id}>
            <InputMenuItem  id={id} variables={variables[id]}/>
          </Menu.Item>)}
      </Menu>
      <div key="buttons" style={{display: "flex", flexDirection: "column"}}>
        <Button onClick={() => changeMode(MODES.TEXT)}>Text</Button>
        <Button onClick={() => changeMode(MODES.CODE)}>Code</Button>
      </div>
      {mode === MODES.TEXT && components.textEditor}
      {mode === MODES.CODE && components.codeEditor}
      {components.blockPreview}
    </div>
  );

}

export default BlockOutputPanel;
