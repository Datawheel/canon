/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Button, Menu} from "@mantine/core";
import {HiOutlineRss} from "react-icons/hi";

/** */
function ConsumerMenu({id}) {

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);

  const block = blocks[id];
  const consumers = useSelector(state => state.cms.reports.entities.consumers);
  const consumerBlocks = useMemo(() => Object.values(consumers || []).filter(d => block.consumers.includes(d.id)), [consumers]);

  return (
    consumerBlocks.length
      ? <Menu
        control={<Button variant="filled"><HiOutlineRss size={16} /></Button>}
        placement="center"
        position="top"
        transition="pop"
        trigger="hover"
        zIndex={1001}
      >
        <Menu.Label>Consumers</Menu.Label>
        {consumerBlocks.map(({id, type}) =>
          <Menu.Item key={id}>
            {`${type}(${id})`}
          </Menu.Item>)}
      </Menu>
      : null
  );

}

export default ConsumerMenu;

