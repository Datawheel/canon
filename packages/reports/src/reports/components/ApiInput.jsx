/* react */
import React, {useState, useRef} from "react";

/* components */
import {ActionIcon, Badge, Group, Popover, Text, TextInput} from "@mantine/core";
import {HiOutlineCheckCircle, HiOutlinePencil} from "react-icons/hi";

/* hooks */
import useKeyPress from "../hooks/listeners/useKeyPress";

/* utils */
import varSwap from "../../utils/variables/varSwap";
import {useVariables} from "../hooks/blocks/useVariables";

import {useBlock, useFormatters} from "../hooks/blocks/selectors";

/** */
function ApiInput({defaultValue, id, onChange, onEnterPress}) {

  const {variables} = useVariables(id);
  const formatterFunctions = useFormatters();

  const [preview, setPreview] = useState(() => varSwap(defaultValue, formatterFunctions, variables));
  const [editing, setEditing] = useState(false);

  const apiRef = useRef();
  const enterPress = useKeyPress(13);
  if (document.activeElement === apiRef.current && enterPress) onEnterPress();

  const onChangeLocal = e => {
    setPreview(varSwap(e.target.value, formatterFunctions, variables));
    onChange(e.target.value);
  };

  const block = useBlock(id);

  const {duration} = block?._status?.duration;

  return (
    <Group noWrap position="apart" spacing="xs">
      <Text lineClamp={1} size="xs">
        <a href={preview} target="_blank" rel="noreferrer">{preview}</a>
      </Text>
      <Group noWrap spacing="xs">
        { duration && <Badge color={duration < 150 ? "green" : duration < 1000 ? "yellow" : "red"}>{duration}ms</Badge> }
        <Popover
          onClose={() => setEditing(false)}
          opened={editing}
          position="right"
          spacing="xs"
          target={
            <ActionIcon size="xs" onClick={() => setEditing(e => !e)} variant="filled" color={ editing ? "green" : "gray"}>
              { editing ? <HiOutlineCheckCircle /> : <HiOutlinePencil /> }
            </ActionIcon>
          }
          withArrow={true}
        >
          <TextInput
            key="text-input"
            placeholder="API"
            defaultValue={defaultValue}
            ref={apiRef}
            type="url"
            onChange={onChangeLocal}
            size="xs"
            style={{
              maxWidth: 800,
              width: "60vw"
            }}
          />
        </Popover>
      </Group>
    </Group>
  );

}

export default ApiInput;

