import React, {useState} from "react";
import {Button, Intent, Icon} from "@blueprintjs/core";

import EntityAddButton from "./components/EntityAddButton";
import Block from "./blocks/Block";

import {ENTITY_ADD_BUTTON_TYPES} from "./components/consts";

import "./BlockInputPicker.css";

/**
 *
 */
function BlockInputPicker({block}) {

  const inputs = block.inputs;

  const addInput = value => {
    console.log(value);
  };

  return (
    <div className="cms-block-input-picker">
      {inputs.map(block =>
        <Block key={`block-${block.id}`} mode="input" block={block}/>
      )}
      <EntityAddButton
        type={ENTITY_ADD_BUTTON_TYPES.SELECT}
        label="Block Type"
        onSubmit={value => addInput(value)}
        selections={Object.values(inputs).map(d => ({label: d, value: d}))}
        renderTarget={props => <Button {...props} className="cms-block-add-input-button" intent={Intent.PRIMARY}><Icon icon="add" /></Button>}
      />
    </div>
  );

}

export default BlockInputPicker;
