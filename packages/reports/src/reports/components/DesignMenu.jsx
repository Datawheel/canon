/* react */
import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {ActionIcon, Checkbox, Group, NumberInput, Popover, SegmentedControl} from "@mantine/core";
import {BsPalette} from "react-icons/bs";

/* hooks */
import {useBlock} from "../hooks/blocks/selectors";

/* redux */
import {updateEntity} from "../../actions/reports";

/* enums */
import {ENTITY_TYPES} from "../../utils/consts/cms";
import {REQUEST_STATUS} from "../../utils/consts/redux";

import settings from "../../utils/settings/block";

/**
 *
 */
function DesignMenu({id}) {

  const dispatch = useDispatch();

  const block = useBlock(id);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultWidth = 400;
  const width = block.settings.width || "stretch";

  const handleChangeWidth = (stretch, value) => {
    const result = stretch ? value ? "stretch" : `${defaultWidth}` : value;
    handleChange("width", result);
  };

  const handleChange = (field, value) => {
    const payload = {
      id,
      settings: {...block.settings, [field]: value}
    };
    setLoading(true);
    dispatch(updateEntity(ENTITY_TYPES.BLOCK, payload)).then(resp => {
      if (resp.status !== REQUEST_STATUS.SUCCESS) { /* todo1.0 toast error*/ }
      setLoading(false);
    });
  };

  return <Popover
    gutter={0}
    opened={opened}
    onClose={() => setOpened(false)}
    placement="end"
    position="bottom"
    target={
      <ActionIcon
        onClick={() => setOpened(o => !o)}>
        <BsPalette size={20} />
      </ActionIcon>
    }>
    <Group direction="column" spacing="xs">
      {
        Object.entries(settings).map(([key, {label, defaultValue, options}]) =>
          <Group key={key} spacing="xs" position="apart" noWrap style={{width: "100%"}}>
            { label && <span>{label}</span> }
            <SegmentedControl
              defaultValue={String(block.settings[key] || defaultValue)}
              onChange={e => handleChange(key, e)} data={options} />
          </Group>
        )
      }
      <Group key="width" spacing="xs">
        <span>Width</span>
        <Group spacing="xs">
          <NumberInput
            defaultValue={defaultWidth}
            disabled={width === "stretch"}
            min={25}
            onChange={value => handleChangeWidth(false, value)}
            placeholder={width === "stretch" ? defaultWidth : width}
            step={5}
            style={{width: 80}}
            value={width} />
          <Checkbox label="Stretch" checked={width === "stretch"} onChange={e => handleChangeWidth(true, e.currentTarget.checked)} />
        </Group>
      </Group>
    </Group>
  </Popover>;

}

export default DesignMenu;
