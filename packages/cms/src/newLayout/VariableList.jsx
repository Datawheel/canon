/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Textarea} from "@mantine/core";
import {format} from "pretty-format";

/* css */
import "./VariableList.css";

/**
 *
 */
function VariableList({id}) {

  /* redux */
  const blocks = useSelector(state => state.cms.profiles.entities.blocks);
  const block = blocks[id];

  const {variables, response} = useMemo(() => {
    const variables = Object.values(blocks)
      .filter(d => block.inputs.includes(d.id))
      .reduce((acc, d) => ({...acc, ...d._variables}), {});
    const response = block._status.response ? format(block._status.response) : false;
    return {variables, response};
  }, [blocks]);

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      Variables
      <div key="vl" className="cms-block-variable-list" style={{height: response ? 300 : 700}}>
        <ul>
          {Object.keys(variables).map(d => <li key={d}>{`${d}: ${variables[d]}`}</li>)}
        </ul>
      </div>
      {response && <div key="resp">
        <Textarea size="xs" value={response} styles={{input: {fontFamily: "monospace"}}} label="API Response" minRows={17} />
      </div> }
    </div>
  );

}

export default VariableList;
