/* react */
import React from "react";
import {useSelector} from "react-redux";

/* components */
import {Text, useMantineTheme} from "@mantine/core";
import ConsoleVariable from "./ConsoleVariable";

/** */
function InputMenuItem({active = [], id = false, variables}) {

  const block = id && useSelector(state => state.cms.reports.entities.blocks[id]);

  const label = block ? block.type : "block";
  const keys = Object.keys(variables);

  const theme = useMantineTheme();

  return (
    <table>
      <tbody>
        { keys.length
          ? keys.map(d => <tr key={d}
          >
            <td>
              <Text color={active.includes(d) ? theme.primaryColor : "dimmed"} size="xs" weight={700}>
                {`{{${d}}}`}
              </Text>
            </td>
            <td>
              <ConsoleVariable value={variables[d]} />
            </td>
          </tr>)
          : <Text color="dimmed" size="xs">
            <i>empty {label}</i>
          </Text>}
      </tbody>
    </table>
  );

}

export default InputMenuItem;

