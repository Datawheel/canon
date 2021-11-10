import React, {useState} from "react";
import {Button, Intent} from "@blueprintjs/core";
import {useDispatch, useSelector} from "react-redux";

import "./VariableList.css";

const MODES = {
  INPUT: "input",
  OUTPUT: "output"
};

/**
 *
 */
function VariableList({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {block, variables} = useSelector(state => {
    const block = state.cms.profiles.entities.blocks[id];
    const inputs = Object.values(state.cms.profiles.entities.blocks).filter(d => block.inputs.includes(d.id));
    const variables = inputs.reduce((acc, d) => ({...acc, ...d._variables}), {});
    return {block, variables};
  });

  if (!block) return null;

  return (
    <div className="cms-block-variable-list">
      <ul>
        {Object.keys(variables).map(d => <li key={d}>{`${d}: ${variables[d]}`}</li>)}
      </ul>
    </div>
  );

}

export default VariableList;
