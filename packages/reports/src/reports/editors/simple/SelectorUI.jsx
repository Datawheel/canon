import React, {useCallback, useEffect, useState} from "react";
import {ActionIcon, Checkbox, InputWrapper, Select, TextInput} from "@mantine/core";
import {AiOutlinePlus as PlusIcon} from "react-icons/ai";
import {HiOutlineTrash as TrashIcon} from "react-icons/hi";

import {useVariables} from "../../hooks/blocks/useVariables";

import "./SelectorUI.css";
import {stringifyObject} from "../../../utils/js/stringifyObject";


// TYPEDEFS

/**
 * @typedef DynamicOptionsSimpleState
 * @property {string} optionsVar - variable name that provides list of data used to generate Selector options
 * @property {string} idKey - property name of data objects in optionsVar list to be used as options' identifier
 * @property {string} labelKey - property name of data objects in optionsVar list to be used as options' human readable label
 * @property {string} defaultVar - variable name of variable that specifies the ID of the option that should be selected
 * by default in a selector
 */


// CONSTANTS

const SELECTOR_TYPE = {
  SINGLE: {value: "single", label: "Single"},
  MULTI: {value: "multi", label: "Multi"}
};

const DEFAULT_SELECTOR_TYPE = SELECTOR_TYPE.SINGLE.value;

const SELECTOR_OPTION_TYPE = {
  STATIC: {value: "static", label: "Static"},
  DYNAMIC: {value: "dynamic", label: "Dynamic"}
};

const DEFAULT_OPTION_TYPE = SELECTOR_OPTION_TYPE.STATIC.value;


// HELPER FUNCTIONS

/** Function to determine whether a variable could be used as a list of Selector options */
const isValidSelectorOptionsArray = variable => variable && Array.isArray(variable);

/** Function to determine whether a variable could be used as a Selector's default value ID */
const isValidDefaultVariable = variable => variable && !Array.isArray(variable);


// COMPONENTS

/**
 * Component for rendering user-friendly simple UI for creating selector-type blocks
 * and converting a user's selections into code.
 * @param {import("../SimpleUI").BlockEditorUIProps} props
 */
function SelectorUI(props) {

  const {id, locale, executeButton, onChange, simpleState} = props;

  // TODO - improve variables names
  const [selectorIdentifier, setSelectorIdentifier] = useState("");
  const [selectorType, setSelectorType] = useState(DEFAULT_SELECTOR_TYPE);
  const [options, setOptions] = useState({static: [], dynamic: {}});
  const [optionsType, setOptionsType] = useState(DEFAULT_OPTION_TYPE);

  // gather all state-changing fields to detect when this block's content logic
  // and simple state needs to be updated
  const stateFields = [selectorIdentifier, selectorType, options, optionsType];

  // on mount, set form state using existing simpleState
  useEffect(() => {
    if (!simpleState) return;
    setSelectorIdentifier(simpleState.name || "");
    setSelectorType(simpleState.type);
    if (simpleState.options?.hasOwnProperty("dynamic") && simpleState.options?.hasOwnProperty("static")) {
      setOptions(simpleState.options);
    }
    setOptionsType(simpleState.optionsType);
  }, []);

  /**
   * Make parent component aware of changes when internal state changes
   */
  useEffect(
    () => {
      // derive JS function from interal form state
      const logicObj = {
        name: selectorIdentifier,
        type: selectorType
      };
      let defaultValue, logicOptions;

      console.log("Convert to logic", options); // TODO - remove

      // for selectors with statically-defined options...
      if (optionsType === SELECTOR_OPTION_TYPE.STATIC.value) {
        // choose one or more default values based on whether they have been marked as default
        defaultValue = selectorType === SELECTOR_TYPE.SINGLE.value
          ? options.static.find(o => o.isDefault)?.id
          : options.static.filter(o => o.isDefault).map(o => o.id);
        // and simply return the user-defined options with a copied ID as a label (if none exists)
        logicOptions = options.static.map(({id, label}) => ({id, label: label || id}));
      }
      // for selectors with dynamically-defined options...
      else {
        // TODO - write logic for transforming dynamic options
        const {optionsVar, optionsValue, optionsLabel} = options.dynamic;
        console.log("optionsVar", optionsVar);
        logicOptions = `(variables["${optionsVar}"] || []).map(d => ({id: String(d["${optionsValue}"]), label: d["${optionsLabel || optionsValue}"]}))`;
      }

      logicObj.defaultValue = defaultValue;
      logicObj.options = logicOptions;

      // const logic = `return ${JSON.stringify(logicObj, null, "\t")};`;
      const logic = `return ${stringifyObject(logicObj)};`;
      console.log("DEV logic", logic);

      // derive object for saving form state
      const simpleState = {
        name: selectorIdentifier,
        type: selectorType,
        optionsType,
        options
      };
      // todo1.0 - add actual validation function
      onChange(simpleState, logic, true);
    },
    [...stateFields]
  );

  return <>
    <TextInput
      placeholder="mySelector"
      label="Selector Name"
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
    <Select
      label="Options Type"
      value={optionsType}
      onChange={setOptionsType}
      data={Object.values(SELECTOR_OPTION_TYPE)}
    />
    {
      optionsType === SELECTOR_OPTION_TYPE.STATIC.value
        ? <StaticSelectorOptionsEditor
          staticOptions={options.static}
          setStaticOptions={optionsState => setOptions({...options, static: optionsState})}
        />
        : <DynamicSelectorOptionsEditor
          dynamicOptions={options.dynamic}
          setDynamicOptions={optionsState => setOptions({...options, dynamic: optionsState})}
          id={id}
        />
    }
    {executeButton}
  </>;
}

/** Component for defining and editing static, pre-defined options for a Selector block */
function StaticSelectorOptionsEditor({staticOptions, setStaticOptions}) {

  /** Add another option to selector */
  const addOption = useCallback(
    () => setStaticOptions([...staticOptions, {isDefault: !staticOptions.length, id: "", label: ""}]),
    [staticOptions, setStaticOptions]
  );

  /** Change the values of an option at a specific index */
  const editOption = useCallback(
    (idx, newValues) => {
      if (!newValues || idx >= staticOptions.length || idx < 0) return;

      const newOptions = [...staticOptions];
      newOptions.splice(idx, 1, {...staticOptions[idx], ...newValues});
      setStaticOptions(newOptions);
      // TODO - set error
    },
    [staticOptions, setStaticOptions]
  );


  const deleteOption = useCallback(
    idx => {
      const newOptions = [...staticOptions];
      newOptions.splice(idx, 1);
      setStaticOptions(newOptions);
    },
    [staticOptions, setStaticOptions]
  );
  return <>
    <InputWrapper
      required
      label="Static Selector Options"
    >
      <table>
        <thead>
          {staticOptions.length > 0 &&
            <tr>
              {["Default", "ID", "Label", ""]
                .map((label, idx) =>
                  <td className={idx ? "" : "selector-option-default-col"} key={`heading-${idx}`}>{label}</td>)
              }
            </tr>
          }
        </thead>
        <tbody>
          {
            staticOptions.map((option, idx) =>
              <StaticSelectorOptionRow
                option={option}
                key={`option-${idx}`}
                editOption={vals => editOption(idx, vals)}
                deleteOption={() => deleteOption(idx)}
              />)
          }
        </tbody>
      </table>
    </InputWrapper>
    <ActionIcon onClick={addOption}><PlusIcon/></ActionIcon>
  </>;
}

/**
 * Renders a single option row for a static option selector
 * @param {*} props
 */
function StaticSelectorOptionRow({option, editOption, deleteOption}) {
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

/**
 * Component that handles the UI for composing Selector state for a dynamic options-type Selector
 * @param {{id: string, dynamicOptions: DynamicOptionsSimpleState, setDynamicOptions}} props
 * @returns
 */
function DynamicSelectorOptionsEditor({id, dynamicOptions, setDynamicOptions}) {
  // State that will actually be stored in the selector block state
  const {variables} = useVariables(id);

  console.log("DEV dynamic options", dynamicOptions); // TODO - remove

  // TODO - add internal state to track isDefault var

  const [optionListVariableKey, setOptionListVariableKey] = useState(dynamicOptions?.optionsVar);
  const [optionValueSelector, setOptionValueSelector] = useState(dynamicOptions?.idKey);
  const [optionLabelSelector, setOptionLabelSelector] = useState(dynamicOptions?.labelKey);
  const [defaultId, setDefaultId] = useState(dynamicOptions?.defaultVar);

  const stateFields = [defaultId, optionListVariableKey, optionValueSelector, optionLabelSelector];

  // State that is used to populate the select component options
  const [optionVariableMap, setOptionVariableMap] = useState({});
  const [defaultVariableList, setDefaultVariableList] = useState([]);
  const [valueSelectorList, setValueSelectorList] = useState([]);

  // populate the select options for choosing variables for the Selector options list and the default ID
  useEffect(() => {
    // if no variables, set to empty
    if (!variables) {
      setOptionVariableMap({});
      setDefaultVariableList([]);
    }
    // get and set all possible variables that can be used as a list of options for the Selector
    const validVariableMap = Object.entries(variables)
      .filter(([variableName, variableContent]) => isValidSelectorOptionsArray(variableContent))
      .reduce((acc, [variableName, variableContent]) => {
        acc[variableName] = variableContent;
        return acc;
      }, {});
    setOptionVariableMap(validVariableMap);
    if (!validVariableMap.hasOwnProperty(optionListVariableKey)) setOptionListVariableKey();

    // get and set all possible variables that can be used to get the default Selector value ID
    const validDefaultIdList = Object.values(variables).filter(isValidDefaultVariable);
    setDefaultVariableList(validDefaultIdList);
    if (!validDefaultIdList.includes(defaultId)) setDefaultId();
  }, [variables]);

  // populate option list for the value and label selectors when the variable option list changes
  useEffect(() => {
    // get list of all unique keys in variable arrays
    const keySet = new Set();
    (optionVariableMap[optionListVariableKey] || []).forEach(
      content => Object.keys(typeof content === "object" ? content : {}).forEach(varProperty => keySet.add(varProperty))
    );
    const allPropertyOptions = Array.from(keySet).sort().map(propertyName => propertyName);
    // set available options for choosing each of the selector's option's value and label
    setValueSelectorList(allPropertyOptions);

    // if (!keySet.has(optionValueSelector)) setOptionValueSelector();
    // if (!keySet.has(optionLabelSelector)) setOptionLabelSelector();
  }, [optionVariableMap, optionListVariableKey]);

  // // use existing state on mount
  // useEffect(() => {
  //   console.log("Init Set dynamic options", dynamicOptions);
  //   if (!dynamicOptions) return;
  //   setOptionListVariableKey(dynamicOptions.optionsVar);
  //   setOptionValueSelector(dynamicOptions.optionsValue);
  //   setOptionLabelSelector(dynamicOptions.optionsLabel);
  //   setDefaultId(dynamicOptions.defaultId);
  // }, []);

  // signal that state has changed
  useEffect(() => {
    const dynamicState = {
      defaultId,
      optionsVar: optionListVariableKey,
      optionsValue: optionValueSelector,
      optionsLabel: optionLabelSelector
    };
    setDynamicOptions(dynamicState);
  }, stateFields);

  return <>
    <Select
      label="Options List Variable"
      value={optionListVariableKey}
      required
      onChange={setOptionListVariableKey}
      data={Object.keys(optionVariableMap)}
    />
    <Select
      label="Options ID Key"
      value={optionValueSelector}
      required
      onChange={setOptionValueSelector}
      data={valueSelectorList}
    />
    <Select
      label="Options Label Key"
      value={optionLabelSelector}
      onChange={setOptionLabelSelector}
      data={valueSelectorList}
    />
    <Select
      label="Default ID Variable"
      value={defaultId}
      onChange={setDefaultId}
      data={defaultVariableList}
    />
  </>;
}

export default SelectorUI;
