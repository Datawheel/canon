/* react */
import React from "react";
import {useSelector} from "react-redux";

/* components */
import {Text} from "@mantine/core";
import ConsoleVariable from "./ConsoleVariable";

/** */
function InputMenuItem({reserved = [], id, variables}) {

  const block = useSelector(state => id ? state.cms.reports.entities.blocks[id] : false);

  const label = block ? block.type : "block";
  const keys = Object.keys(variables);

  return (
    <div>
      { keys.length
        ? keys
          .filter(o => variables[o])
          .map(d =>
            <ConsoleVariable
              key={d}
              dimmed={reserved.includes(d)}
              label={d}
              value={variables[d]}
            />
          )
        : <Text color="dimmed" size="xs">
          <i>empty {label}</i>
        </Text>}
    </div>
  );

}

export default InputMenuItem;

