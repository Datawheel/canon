import React, {useCallback, useEffect, useState} from "react";
import {ActionIcon, Checkbox, InputWrapper, Select, TextInput} from "@mantine/core";
import {AiOutlinePlus as PlusIcon} from "react-icons/ai";
import {HiOutlineTrash as TrashIcon} from "react-icons/hi";

import {useVariables} from "../../hooks/blocks/useVariables";

import "./SelectorUI.css";
import {stringifyObject} from "../../../utils/js/stringifyObject";


// TYPEDEFS

/** @typedef {"single" | "multi"} SelectorType  */
/** @typedef {"static" | "dynamic"} OptionType  */
/**
 * @typedef DynamicOptionsSimpleState
 * @property {string} optionsVar - variable name that provides list of data used to generate Selector options
 * @property {string} idKey - property name of data objects in optionsVar list to be used as options' identifier
 * @property {string} labelKey - property name of data objects in optionsVar list to be used as options' human readable label
 * @property {string} defaultVar - variable name of variable that specifies the ID of the option that should be selected
 * @property {boolean} isPrimitiveType - flag telling whether or not the variable contains primitive elements (not objects)
 * by default in a selector
 */

/**
 * @typedef SelectorSimpleState
 * @property {string} name - label used to when rendering the selector
 * @property {{static: StaticOptionsArray, dynamic: DynamicOptionsSimpleState}} options - state for describing the editor state
 * for both methods of generating options
 * @property {OptionType} optionsType - the chosen method of defining a Selector's options
 * @property {SelectorType} type - whether selector is single choice or multi-choice
 */

// CONSTANTS

const SELECTOR_TYPE = {
  SINGLE: "single",
  MULTI: "multi"
};

const OPTION_TYPE = {
  STATIC: "static",
  DYNAMIC: "dynamic"
};


// HELPER FUNCTIONS

/** Function to determine whether a variable could be used as a list of Selector options */
const isValidSelectorOptionsArray = variable => variable && Array.isArray(variable) && variable.length > 0;

/** Function to determine whether a variable could be used as a Selector's default value ID */
const isValidDefaultVariable = variable => variable && !Array.isArray(variable);

const isPrimitiveTypeVariable = variable => isValidSelectorOptionsArray(variable) && ["string"].includes(typeof variable[0]); 

/**
 * Determines whether the current state of the UI is a valid selector config
 * @param {SelectorSimpleState} simpleState - state of the Selector Editor
 */
const isValidSelectorState = simpleState => {
  const {name, type, optionsType, options} = simpleState;
  // check that all required high level properties are present
  if (![name, type, optionsType, options].every(Boolean)) return false;
  // make sure static options have at least one option
  if (optionsType === OPTION_TYPE.STATIC) return options.static?.length > 0 && options.static?.every(o => o.id);
  // make sure dynamic options of non-primitive type specify idKey
  if (!options.dynamic?.isPrimitiveType) return !!options.dynamic?.idKey;
  return true;
};


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
  const [selectorType, setSelectorType] = useState(SELECTOR_TYPE.SINGLE);
  const [options, setOptions] = useState({static: [], dynamic: {}});
  const [optionsType, setOptionsType] = useState(OPTION_TYPE.STATIC);

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

      // for selectors with statically-defined options...
      if (optionsType === OPTION_TYPE.STATIC) {
        // choose one or more default values based on whether they have been marked as default
        defaultValue = selectorType === SELECTOR_TYPE.SINGLE
          ? options.static.find(o => o.isDefault)?.id
          : options.static.filter(o => o.isDefault).map(o => o.id);
        // and simply return the user-defined options with a copied ID as a label (if none exists)
        logicOptions = options.static.map(({id, label}) => ({id, label: label || id}));
      }
      // for selectors with dynamically-defined options...
      else {
        const {optionsVar, idKey, labelKey, defaultVar, isPrimitiveType} = options.dynamic;
        if (defaultVar) defaultValue = `{{${defaultVar}}}`;
        logicOptions = isPrimitiveType
          ? `variables["${optionsVar}"]`
          : `(variables["${optionsVar}"] || []).map(d => ({id: String(d["${idKey}"]), label: d["${labelKey || idKey}"]}))`;
      }

      if (defaultValue) logicObj.defaultValue = defaultValue;
      logicObj.options = logicOptions;

      // const logic = `return ${JSON.stringify(logicObj, null, "\t")};`;
      const logic = `return ${stringifyObject(logicObj)};`;

      // derive object for saving form state
      const simpleState = {
        name: selectorIdentifier,
        type: selectorType,
        optionsType,
        options
      };
      // todo1.0 - add actual validation function
      const isValid = isValidSelectorState(simpleState);
      onChange(simpleState, logic, isValid);
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
      data={Object.values(OPTION_TYPE)}
    />
    {
      optionsType === OPTION_TYPE.STATIC
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
                  <td
                    className={`${idx === 0 ? "selector-option-default-col" : ""} ${idx === 1 ? "required" : ""}`}
                    key={`heading-${idx}`}>{label}
                  </td>)
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

  const {optionsVar, idKey, labelKey, defaultVar, isPrimitiveType} = dynamicOptions;

  // State that will actually be stored in the selector block state
  const {variables} = useVariables(id);
  const [isInitialized, setIsInitialized] = useState(false);

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

    // get and set all possible variables that can be used to get the default Selector value ID
    const validDefaultIdList = Object.entries(variables)
      .filter(([key, val]) => isValidDefaultVariable(val))
      .map(([key, val]) => key);

    setDefaultVariableList(validDefaultIdList);
    setIsInitialized(true);
  }, [variables]);

  const setState = useCallback((key, val) => {
    setDynamicOptions({...dynamicOptions, [key]: val});
  }, [dynamicOptions]);

  // populate option list for the value and label selectors when the variable option list changes
  useEffect(() => {
    if (!Object.keys(optionVariableMap).length) return;
    // if selected variable contains objects
    const isPrimitiveType = isPrimitiveTypeVariable(optionVariableMap[optionsVar]);

    if (!isPrimitiveType) {
      // get list of all unique keys in variable arrays
      const keySet = new Set();
      (optionVariableMap[dynamicOptions.optionsVar] || []).forEach(
        content => Object.keys(typeof content === "object" ? content : {}).forEach(varProperty => keySet.add(varProperty))
      );
      const allPropertyOptions = Array.from(keySet).sort().map(propertyName => propertyName);
      // set available options for choosing each of the selector's option's value and label
      setValueSelectorList(allPropertyOptions);
    }
    // else, set the ID and label fields to null
    else {
      setValueSelectorList([]);
      setState("idKey", null);
      setState("labelKey", null);
    }
    setState("isPrimitiveType", isPrimitiveType);
  }, [optionVariableMap, optionsVar]);

  const setOptionVar = useCallback(val => {
    setDynamicOptions({
      ...dynamicOptions,
      optionsVar: val,
      idKey: null,
      labelKey: null
    });
  }, [dynamicOptions, setDynamicOptions]);

  if (!isInitialized) return null;

  const optionsVarList = Object.keys(optionVariableMap);
  const isPopulated = list => list && Array.isArray(list) && list.length;

  return <>
    <Select
      label="Options List Variable"
      placeholder="Pick a variable"
      value={isPopulated(optionsVarList) && optionsVar}
      required
      onChange={setOptionVar}
      data={optionsVarList}
    />
    <Select
      label="Options ID Key"
      placeholder="Pick a property key"
      value={isPopulated(valueSelectorList) && idKey}
      required={!isPrimitiveType}
      disabled={isPrimitiveType}
      onChange={val => setState("idKey", val)}
      data={valueSelectorList}
    />
    <Select
      label="Options Label Key"
      placeholder="Pick a property key"
      disabled={isPrimitiveType}
      clearable
      value={isPopulated(valueSelectorList) && labelKey}
      onChange={val => setState("labelKey", val)}
      data={valueSelectorList}
    />
    <Select
      label="Default ID Variable"
      placeholder="Pick a variable"
      clearable
      value={isPopulated(defaultVariableList) && defaultVar}
      onChange={val => setState("defaultVar", val)}
      data={defaultVariableList}
    />
  </>;
}

export default SelectorUI;
