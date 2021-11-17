import React, {useState} from "react";
import {ActionIcon} from "@mantine/core";
import {useDispatch, useSelector} from "react-redux";
import {HiOutlinePlusCircle} from "react-icons/hi";

import EntityAddButton from "../components/EntityAddButton";
import BlockInput from "./BlockInput";

import {newEntity} from "../../actions/profiles";

import {ENTITY_ADD_BUTTON_TYPES} from "../components/consts";
import {ENTITY_TYPES} from "../../utils/consts/cms";

import "./BlockInputPanel.css";

/**
 *
 */
function BlockInputPanel({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {block, sourceBlocks} = useSelector(state => {
    const block = state.cms.profiles.entities.blocks[id];
    const sourceBlocks = Object.values(state.cms.profiles.entities.blocks).filter(d => {
      const sameSection = d.section_id === block.section_id;
      const sameBlock = d.id === block.id;
      const inUse = block.inputs.includes(d.id);
      return sameSection && !sameBlock && !inUse;
    });
    // sourceBlocks.push({type: "+New API Call", value: "api"});
    return {block, sourceBlocks};
  });

  const addInput = id => {
    const payload = {
      input_id: Number(id),
      block_id: block.id
    };
    dispatch(newEntity(ENTITY_TYPES.BLOCK_INPUT, payload));
  };

  const {inputs} = block;

  return (
    <div className="cms-block-input">
      {inputs.map(id =>
        <BlockInput key={`block-${id}`} id={id}/>
      )}
      <EntityAddButton
        type={ENTITY_ADD_BUTTON_TYPES.SELECT}
        label="Block"
        onSubmit={value => addInput(value)}
        // Mantine Select expect strings for select values, turn it back to int before sending in addInput
        selections={sourceBlocks.map(d => ({label: `${d.type}(${d.id})`, value: String(d.id)}))}
        target={<ActionIcon size="xl" radius="xl"><HiOutlinePlusCircle size={30} /></ActionIcon>}
      />
    </div>
  );

}

export default BlockInputPanel;
