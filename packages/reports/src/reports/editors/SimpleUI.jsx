/* react */
import React from "react";
import {BLOCK_MAP, BLOCK_TYPES} from "../../utils/consts/cms";
import SelectorUI from "./simple/SelectorUI";
import RichTextEditor from "../editors/RichTextEditor";
import {useVariables} from "../hooks/blocks/useVariables";

/**
 * Props expected by generalized SimpleUI components.
 * @typedef {Object} SimpleUIProps
 * @property {string} blockType - type of block being edited (BLOCK_TYPES)
 * @property {React.Component} executeButton - button for saving changes to database
 * @property {number} id - the ID of the block that this editor is editing
 * @property {string} locale - locale key for locale currently being edited
 * @property {(content: Object, locale: string, flagModified: boolean, isValidated: boolean) => void} setBlockContent
 * - callback for submitting changes to a Block's working state while editing
 * @property {Object} simpleState - saved state of simple UI form
 */

/**
 * Props expected by all SimpleUI-type component implementations.
 * @typedef {Object} BlockEditorUIProps
 * @property {React.Component} executeButton - button for saving changes to database
 * @property {number} id - the ID of the block that this editor is editing
 * @property {string} locale - locale key for locale currently being edited
 * @property {(logic: string, simpleState: string, isValidated: boolean) => void} onChange - callback submitting changes
 * @property {Object} simpleState - saved state of simple UI form
 */

const CUSTOM_SIMPLE_UI_COMPONENTS = {
  [BLOCK_TYPES.SELECTOR]: SelectorUI
};

/**
 * Generalized wrapper component that renders a simple GUI editor
 * for the appropriate block type
 * @param {SimpleUIProps} props
 */
const SimpleUI = props => {

  const {blockType, executeButton, id, locale, setBlockContent, simpleState} = props;

  const {variables} = useVariables(id);

  /** Tailor-made component for editing and composing a specific Block type */
  const CustomUIComponent = CUSTOM_SIMPLE_UI_COMPONENTS[blockType];

  // if a custom "simple" UI editor is implemented for Block type, use that
  if (CustomUIComponent) {
    return <CustomUIComponent
      id={id}
      executeButton={executeButton}
      onChange={(simple, logic, isValidated = true) => setBlockContent({simple, logic}, locale, true, isValidated)}
      simpleState={simpleState}
    />;
  }

  // else, fall back to RichTextEditor
  return <RichTextEditor
    key="text-editor"
    fields={BLOCK_MAP[blockType]}
    locale={locale}
    defaultContent={simpleState}
    blockType={blockType}
    variables={variables}
    onChange={setBlockContent}
    onTextModify={() => setBlockContent()}// set modified to be true  but don't update state
  />;
};

export default SimpleUI;
