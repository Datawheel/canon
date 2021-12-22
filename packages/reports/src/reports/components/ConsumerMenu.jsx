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
    <Menu zIndex={1001} position="top" control={<Button disabled={!consumerBlocks.length} variant="outline" leftIcon={<HiOutlineRss />}>View Consumers</Button>}>
      {consumerBlocks.map(({id, type}) =>
        <Menu.Item key={id}>
          {`${type}(${id})`}
        </Menu.Item>)}
    </Menu>
  );

}

export default ConsumerMenu;

