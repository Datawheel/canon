/* react */
import React from "react";
import {BLOCK_TYPES} from "../../utils/consts/cms";
import SelectorUI from "./simple/SelectorUI";

/**
 * Props expected by all SimpleUI-type components.
 * @typedef {Object} SimpleUIProps
 * @property {(logic: string, simpleState: string, locale: string) => void} onChange - callback for handling
 * @property {string} type - type of block being edited (BLOCK_TYPES)
 * @property {Object} simpleState - saved state of simple UI form
 */

const SIMPLE_UI_COMPONENT_TYPES = {
  [BLOCK_TYPES.SELECTOR]: SelectorUI
};

const getSimpleUIComponent = props => {
  const Comp = SIMPLE_UI_COMPONENT_TYPES[props.type];
  if (!Comp) console.error(`No SimpleUI component for block type ${props.type}`);
  return Comp && <Comp {...props}/>;
};

/**
 * Generalized wrapper component that renders a simple GUI editor
 * for the appropriate block type
 * @param {SimpleUIProps} props
 */
const SimpleUI = props =>
  <>
    {getSimpleUIComponent(props)}
  </>;

export default SimpleUI;
