import React, {useState} from "react";
import {Button, Intent, Icon} from "@blueprintjs/core";
import {useDispatch, useSelector} from "react-redux";

import EntityAddButton from "../components/EntityAddButton";
import Block from "./Block";

import {newEntity} from "../../actions/profiles";

import {ENTITY_ADD_BUTTON_TYPES} from "../components/consts";
import {ENTITY_TYPES} from "../../utils/consts/cms";

import "./BlockInputPicker.css";

/**
 *
 */
function BlockInputPicker({block}) {

  const dispatch = useDispatch();

  /* redux */
  const {sourceBlocks} = useSelector(state => {
    let sourceBlocks = [];
    const profile = state.cms.profiles.find(p => p.id === Number(state.cms.status.pathObj.profile));
    if (profile) {
      const section = profile.sections.find(s => s.id === block.section_id);
      if (section) sourceBlocks = section.blocks.filter(d => d.id !== block.id);
    }
    return {sourceBlocks};
  });


  const inputs = block.inputs;

  const addInput = id => {
    const payload = {
      input_id: Number(id),
      block_id: block.id
    };
    dispatch(newEntity(ENTITY_TYPES.BLOCK_INPUT, payload));
  };

  return (
    <div className="cms-block-input-picker">
      {inputs.map(block =>
        <Block key={`block-${block.id}`} type={ENTITY_TYPES.BLOCK_INPUT} block={block}/>
      )}
      <EntityAddButton
        type={ENTITY_ADD_BUTTON_TYPES.SELECT}
        label="Block Type"
        onSubmit={value => addInput(value)}
        selections={sourceBlocks.map(d => ({label: d.type, value: d.id}))}
        renderTarget={props => <Button {...props} className="cms-block-add-input-button" intent={Intent.PRIMARY}><Icon icon="add" /></Button>}
      />
    </div>
  );

}

export default BlockInputPicker;
