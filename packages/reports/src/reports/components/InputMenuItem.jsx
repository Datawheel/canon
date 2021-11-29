/* react */
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {Popover, List} from "@mantine/core";

/* components */
import {} from "@mantine/core";

/** */
function InputMenuItem({id, variables}) {

  const block = useSelector(state => state.cms.reports.entities.blocks[id]);

  const label = block.type;

  const [opened, setOpened] = useState(false);

  return (
    <Popover
      opened={opened}
      withArrow
      noFocusTrap
      position="right"
      zIndex={1001}
      target={<div style={{display: "block", width: "175px"}} onMouseOver={() => setOpened(true)} onMouseLeave={() => setOpened(false)}>{`${label}(${id})`}</div>}
    >
      <List listStyleType="none">
        {Object.keys(variables).map(d => <List.Item key={d}>{`${d}: ${variables[d]}`}</List.Item>)}
      </List>
    </Popover>
  );

}

export default InputMenuItem;

