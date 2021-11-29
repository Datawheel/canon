/* react */
import React, {useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ThemeIcon, Button, Menu} from "@mantine/core";
import {HiViewGridAdd, HiCheckCircle} from "react-icons/hi";

/* components */
import InputMenuItem from "./InputMenuItem";

/* redux */
import {newEntity, deleteEntity} from "../../actions/reports";

/* consts */
import {ENTITY_TYPES} from "../../utils/consts/cms";

/** */
function InputMenu({id}) {

  const dispatch = useDispatch();

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);

  const block = blocks[id];
  const inputs = useSelector(state => state.cms.reports.entities.inputs);
  const inputBlocks = useMemo(() => Object.values(inputs || []).filter(d => block.inputs.includes(d.id)).reduce((acc, d) => ({...acc, [d.id]: d}), {}), [inputs]);

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

  return (
    <Menu zIndex={1001} control={<Button style={{marginBottom: "15px"}} variant="outline" leftIcon={<HiViewGridAdd />}>Choose Inputs</Button>}>
      {sourceBlocks.map(({id}) =>
        <Menu.Item onClick={() => handleClick(id)} icon={block.inputs.includes(id) ? <ThemeIcon size="xs" radius="xl" color="green"><HiCheckCircle /></ThemeIcon> : null} key={id}>
          <InputMenuItem  id={id} variables={variables[id]}/>
        </Menu.Item>)}
    </Menu>
  );

}

export default InputMenu;

