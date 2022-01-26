/* react */
import React, {useMemo, useState, useRef} from "react";

/* components */
import {ActionIcon, Badge, Group, Popover, Text, TextInput} from "@mantine/core";
import {HiOutlineCheckCircle, HiOutlinePencil} from "react-icons/hi";

/* hooks */
import useKeyPress from "../hooks/listeners/useKeyPress";

/* utils */
import varSwap from "../../utils/variables/varSwap";
import {getBlockContent} from "../../utils/blocks/getBlockContent";
import {useVariables} from "../hooks/blocks/useVariables";
import {useBlock} from "../hooks/blocks/selectors";

/** type-specific methods for deriving data needed for rendering from current Block state */
import PreviewAdapters from "../blocks/types/PreviewAdapters";

/** */
function ApiInput({blockStateContent, defaultValue, id, locale, onChange, onEnterPress}) {

  const {variables} = useVariables(id);
  const [preview, setPreview] = useState(() => varSwap(defaultValue, {}, variables));
  const [editing, setEditing] = useState(false);

  const apiRef = useRef();
  const enterPress = useKeyPress(13);
  if (document.activeElement === apiRef.current && enterPress) onEnterPress();

  const onChangeLocal = e => {
    // todo1.0 put formatters in here
    setPreview(varSwap(e.target.value, {}, variables));
    onChange(e.target.value);
  };

  const block = useBlock(id);

  /**
   * The block content data to use for rendering.
   * If no "blockStateContent" prop is given, defaults to the redux store value of block.
   * Use the "blockStateContent" prop to provide override values if you want to show a
   * live preview of unsaved changes.
   */
  const blockContent = blockStateContent || getBlockContent(block, locale);

  const {duration} = useMemo(() => {

    /** @type {import("./types/PreviewAdapters").BlockPreviewAdapterParams} */
    const adapterParams = {active: true, block, blockContent, debug: true, locale, variables};
    return PreviewAdapters[block.type](adapterParams);

  }, [block, blockContent]);

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

