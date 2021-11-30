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
  // Lookup object of the input blocks this block is subscribed to. Note that there may be no inputs in the entire project (yet), necessitating the || [] 
  const inputBlocks = useMemo(() => Object.values(inputs || []).filter(d => block.inputs.includes(d.id)).reduce((acc, d) => ({...acc, [d.id]: d}), {}), [inputs]);

  // Blocks from this section are always available, as well as ones that are shared by other sections.
  const availableBlocks = useMemo(() => Object.values(blocks)
    .filter(d => d.id !== block.id && (d.section_id === block.section_id || d.shared))
    .sort(d => d.shared ? 1 : -1), 
  [blocks]);
  // When reaching across sections to shared blocks, their variables may not yet be loaded, necessitating the || {}
  const variables = useMemo(() => Object.values(blocks).reduce((acc, d) => ({...acc, [d.id]: d._variables || {}}), {}), [blocks]);

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
      {availableBlocks.map(({id}) =>
        <Menu.Item onClick={() => handleClick(id)} icon={block.inputs.includes(id) ? <ThemeIcon size="xs" radius="xl" color="green"><HiCheckCircle /></ThemeIcon> : null} key={id}>
          <InputMenuItem id={id} variables={variables[id]}/>
        </Menu.Item>)}
    </Menu>
  );

}

export default InputMenu;

