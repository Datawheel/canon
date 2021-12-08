/* react */
import React, {useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ThemeIcon, Button, Menu} from "@mantine/core";
import {HiOutlineLogin, HiLogout, HiCheckCircle, HiPlusCircle, HiOutlineGlobeAlt} from "react-icons/hi";

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
  const inputBlocks = useMemo(() => Object.values(inputs || []).filter(d => block.inputs.includes(d.id)).reduce((acc, d) => ({...acc, [d.id]: d}), {}), [inputs, block]);

  // When reaching across sections to shared blocks, their variables may not yet be loaded, necessitating the || {}
  const variables = useMemo(() => Object.values(blocks).reduce((acc, d) => ({...acc, [d.id]: d._variables || {}}), {}), [blocks]);

  // Blocks from this section are always available, as well as ones that are shared by other sections.
  const availableBlocks = useMemo(() => Object.values(blocks)
    .filter(d =>
      d.id !== block.id &&
      (d.section_id === block.section_id || d.shared)
    )
    .sort((a, b) => {

      const aActive = block.inputs.includes(a.id);
      const bActive = block.inputs.includes(b.id);
      if (aActive !== bActive) return bActive - aActive; // sorts active to the top

      const aKeys = Object.keys(variables[a.id]).length;
      const bKeys = Object.keys(variables[b.id]).length;
      if (aKeys !== bKeys) return bKeys - aKeys; // sort blocks descending by # of keys

      return a.shared - b.shared; // otherwise send shared variables to bottom of list

    }),
  [blocks]);

  const handleClick = id => {
    if (inputBlocks[id]) {
      dispatch(deleteEntity(ENTITY_TYPES.BLOCK_INPUT, {input_id: Number(id), block_id: block.id}));
    }
    else {
      dispatch(newEntity(ENTITY_TYPES.BLOCK_INPUT, {input_id: Number(id), block_id: block.id}));
    }
  };

  return (
    <Menu
      zIndex={1001}
      control={<Button fullWidth style={{marginBottom: "15px"}} leftIcon={<HiOutlineLogin style={{transform: "scaleX(-1)"}} />}>Add New Input</Button>}
      size="xl"
    >
      {availableBlocks.map(({id, shared}) =>
        <Menu.Item
          active={block.inputs.includes(id)}
          disabled={block.consumers.includes(id)}
          onClick={() => handleClick(id)}
          icon={ block.consumers.includes(id)
            ? <ThemeIcon size="xs" radius="xl" color="red" variant="light"><HiLogout /></ThemeIcon>
            : block.inputs.includes(id)
              ? <ThemeIcon size="xs" radius="xl" color="green"><HiCheckCircle /></ThemeIcon>
              : <ThemeIcon size="xs" radius="xl" color="gray"><HiPlusCircle /></ThemeIcon>}
          rightSection={shared ? <ThemeIcon size="xs" radius="xl"><HiOutlineGlobeAlt /></ThemeIcon> : null}
          key={id}>
          <InputMenuItem id={id} variables={variables[id]} active={block.inputs.includes(id) ? Object.keys(variables[id]) : []} />
        </Menu.Item>
      )}
    </Menu>
  );

}

export default InputMenu;

