/* react */
import React from "react";
import {BLOCK_TYPES} from "../../utils/consts/cms";
import SelectorUI from "./simple/SelectorUI";
import RichTextEditor from "../editors/RichTextEditor";

/**
 * Props expected by generalized SimpleUI components.
 * @typedef {Object} SimpleUIProps
 * @property {string} blockType - type of block being edited (BLOCK_TYPES)
 * @property {React.Component} executeButton - button for saving changes to database
 * @property {string} locale - locale key for locale currently being edited
 * @property {(logic: string, simpleState: string, locale: string) => void} setBlockContent - callback for
 * submitting changes to a Block's working state while editing
 * @property {Object} simpleState - saved state of simple UI form
 */

/**
 * Props expected by all SimpleUI-type component implementations.
 * @typedef {Object} BlockEditorUIProps
 * @property {React.Component} executeButton - button for saving changes to database
 * @property {(logic: string, simpleState: string) => void} onChange - callback submitting changes
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

  const {blockType, executeButton, locale, setBlockContent, simpleState} = props;

  /** Tailor-made component for editing and composing a specific Block type */
  const CustomUIComponent = CUSTOM_SIMPLE_UI_COMPONENTS[blockType];

  // if a custom "simple" UI editor is implemented for Block type, use that
  if (CustomUIComponent) {
    return <CustomUIComponent
      executeButton={executeButton}
      onChange={(simple, logic) => setBlockContent({simple, logic}, locale)}
      simpleState={simpleState}
    />;
  }

  // else, fall back to RichTextEditor
  return <RichTextEditor
    key="text-editor"
    locale={locale}
    defaultContent={simpleState}
    blockType={blockType}
    onChange={setBlockContent}
    onTextModify={() => setBlockContent()}// set modified to be true  but don't update state
  />;
};

export default SimpleUI;
