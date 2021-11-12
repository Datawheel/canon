import React, {useState} from "react";

import useKeyPress from "../hooks/listeners/useKeyPress";
import slugifyInput from "../../utils/web/slugifyInput";

import {ENTITY_ADD_BUTTON_TYPES} from "./consts";

import {Popover, Button, Group, TextInput, Select} from "@mantine/core";

/**
 *
 */
function EntityAddButton({type = ENTITY_ADD_BUTTON_TYPES.TEXT, label, onSubmit, target, urlSafe, selections = []}) {

  /* state */
  const [name, setName] = useState("");
  const [selection, setSelection] = useState(type === ENTITY_ADD_BUTTON_TYPES.SELECT && selections[0] ? selections[0].value : null);
  const [opened, setOpened] = useState(false);

  const onClose = () => {
    setName("");
    setOpened(false);
  };

  const onChangeText = e => {
    setName(urlSafe ? slugifyInput(e.target.value) : e.target.value);
  };

  const onChangeSelect = e => {
    setSelection(e);
  };

  const submit = () => {
    const result = type === ENTITY_ADD_BUTTON_TYPES.SELECT ? selection : name;
    onSubmit(result);
    onClose();
  };

  const ENTER_KEY = 13;
  const enterPress = useKeyPress(ENTER_KEY);
  const ready = type === ENTITY_ADD_BUTTON_TYPES.TEXT && name || type === ENTITY_ADD_BUTTON_TYPES.SELECT && selection;
  if (opened && ready && enterPress) submit();

  const popoverProps = {
    zIndex: 1001, // Over Mantine Modal's 1000
    opened,
    onClose,
    target: React.cloneElement(target, {onClick: () => setOpened(true)}),
    position: "right"
  };

  return (
    <Popover
      withArrow
      {...popoverProps}
    >
      <Group direction="column">
        <label>{label}</label>
        {type === ENTITY_ADD_BUTTON_TYPES.TEXT && <TextInput placeholder="Enter Name" value={name} autoFocus onChange={onChangeText} />}
        {type === ENTITY_ADD_BUTTON_TYPES.SELECT && <Select searchable={true} onChange={onChangeSelect} value={selection} data={selections.map(d => ({value: d.value, label: d.label}))} /> }
        <Button onClick={submit} loading={!ready}>Submit</Button>
      </Group>
    </Popover>

  );

}

export default EntityAddButton;
