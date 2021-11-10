import React, {useState} from "react";
import {Button, Intent} from "@blueprintjs/core";
import {useDispatch, useSelector} from "react-redux";

import {newEntity, deleteEntity} from "../actions/profiles";

import "./VariableList.css";
import {ENTITY_TYPES} from "../utils/consts/cms";

/**
 *
 */
function VariableList({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {block, variables, allVariables, allVariablesSources, allInputs} = useSelector(state => {
    const block = state.cms.profiles.entities.blocks[id];
    const blocks = Object.values(state.cms.profiles.entities.blocks);
    const allVariables = blocks.reduce((acc, d) => ({...acc, ...d._variables}), {});
    const allVariablesSources = blocks.reduce((acc, d) => d._variables ? {...acc, ...Object.keys(d._variables).reduce((acc2, d2) => ({...acc2, [d2]: d.id}), {})} : acc, {});
    const inputs = blocks.filter(d => block.inputs.includes(d.id));
    const variables = inputs.reduce((acc, d) => ({...acc, ...d._variables}), {});
    const allInputs = state.cms.profiles.entities.inputs;
    return {block, variables, allVariables, allVariablesSources, allInputs};
  });

  if (!block) return null;

  const onClick = variable => {
    const id = allVariablesSources[variable];
    const inUse = variables[variable] !== undefined;
    if (!inUse) {
      const payload = {
        input_id: id,
        block_id: block.id
      };
      dispatch(newEntity(ENTITY_TYPES.BLOCK_INPUT, payload));
    }
    else {
      const payload = {
        id: Object.values(allInputs).find(d => d.block_input.input_id === id).block_input.id
      };
      dispatch(deleteEntity(ENTITY_TYPES.BLOCK_INPUT, payload));
    }
  };

  return (
    <div className="cms-block-variable-list">
      <ul>
        {Object.keys(allVariables).map(d => <li key={d} onClick={() => onClick(d)} style={{fontWeight: `${variables[d] ? "bold" : "normal"}`}}>{`${d}: ${allVariables[d]}`}</li>)}
      </ul>
    </div>
  );

}

export default VariableList;
