import React, {useCallback, useEffect, useState} from "react";
import {ActionIcon, Checkbox, InputWrapper, Select, TextInput} from "@mantine/core";
import {AiOutlinePlus as PlusIcon} from "react-icons/ai";
import {HiOutlineTrash as TrashIcon} from "react-icons/hi";

import "./SelectorUI.css";

const SELECTOR_TYPE = {
  SINGLE: {value: "single", label: "Single"},
  MULTI: {value: "multi", label: "Multi"}
};

const DEFAULT_SELECTOR_TYPE = SELECTOR_TYPE.SINGLE.value;

/**
 * Component for rendering user-friendly simple UI for creating selector-type blocks
 * and converting a user's selections into code.
 * @param {import("../SimpleUI").BlockEditorUIProps} props
 */
function SelectorUI(props) {

  const {executeButton, onChange, simpleState} = props;

  const [selectorIdentifier, setSelectorIdentifier] = useState("");
  const [selectorType, setSelectorType] = useState(DEFAULT_SELECTOR_TYPE);
  const [options, setOptions] = useState([]);
  const stateFields = [selectorIdentifier, selectorType, options];

  // on mount, set form state using existing simpleState
  useEffect(() => {
    setSelectorIdentifier(simpleState?.name || "");
    setSelectorType(simpleState.type);
    setOptions(simpleState.options);
  }, []);

  /** Add another option to selector */
  const addOption = useCallback(
    () => setOptions([...options, {isDefault: !options.length, id: "", label: ""}]),
    [options, setOptions]
  );

  /** Change the values of an option at a specific index */
  const editOption = useCallback(
    (idx, newValues) => {
      if (!newValues || idx >= options.length || idx < 0) return;

      const newOptions = [...options];
      newOptions.splice(idx, 1, {...options[idx], ...newValues});
      const updatedOption = newOptions[idx];
      if (updatedOption.id) {
        setOptions(newOptions);
        return;
      }
      // TODO - set error
    },
    [options, setOptions]
  );


  const deleteOption = useCallback(
    idx => {
      const newOptions = [...options];
      newOptions.splice(idx, 1);
      setOptions(newOptions);
    },
    [options, setOptions]
  );

  /**
   * Make parent component aware of changes when internal state changes
   */
  useEffect(
    () => {
      // derive JS function from interal form state
      const logicObj = {
        name: selectorIdentifier,
        type: selectorType,
        defaultValue: selectorType === SELECTOR_TYPE.SINGLE.value
          ? options.find(o => o.isDefault)?.id
          : options.filter(o => o.isDefault).map(o => o.id),
        options: options.map(({id, label}) => ({id, label: label || id}))
      };
      const logic = `return ${JSON.stringify(logicObj, null, "\t")};`;
      // derive object for saving form state
      const simpleState = {
        name: selectorIdentifier,
        type: selectorType,
        options
      };
      onChange(simpleState, logic);
    },
    [...stateFields]
  );

  return <>
    <TextInput
      placeholder="mySelector"
      label="Selector Identifier"
      required
      value={selectorIdentifier}
      onChange={e => setSelectorIdentifier(e.currentTarget.value)}
    />
    <Select
      label="Selector Type"
      value={selectorType}
      onChange={setSelectorType}
      data={Object.values(SELECTOR_TYPE)}
    />
    <InputWrapper
      required
      label="Select Options"
    >
      <table>
        <thead>
          {options.length > 0 &&
            <tr>
              {["Default", "ID", "Label", ""].map((label, idx) => <td className={idx ? "" : "selector-option-default-col"} key={`heading-${idx}`}>{label}</td>)}
            </tr>
          }
        </thead>
        <tbody>
          {
            options.map((option, idx) =>
              <SelectorStaticOption
                option={option}
                key={`option-${idx}`}
                editOption={vals => editOption(idx, vals)}
                deleteOption={() => deleteOption(idx)}
              />)
          }
        </tbody>
      </table>
      <ActionIcon onClick={addOption}><PlusIcon/></ActionIcon>
    </InputWrapper>
    {executeButton}
  </>;
}

/**
 * Renders a single option row for a static option selector
 * @param {*} props
 */
function SelectorStaticOption({option, editOption, deleteOption}) {
  return <tr className="reports-selector-static-option">
    <td>
      <Checkbox
        checked={option.isDefault}
        onChange={event => editOption({isDefault: event.currentTarget.checked})}
      />
    </td>
    <td>
      <TextInput
        placeholder="myOption"
        value={option.id}
        onChange={event => editOption({id: event.currentTarget.value})}
      />
    </td>
    <td>
      <TextInput
        placeholder="myOption"
        value={option.label}
        onChange={event => editOption({label: event.currentTarget.value})}
      />
    </td>
    <td>
      <ActionIcon onClick={deleteOption}>
        <TrashIcon/>
      </ActionIcon>
    </td>
  </tr>;
}

export default SelectorUI;
