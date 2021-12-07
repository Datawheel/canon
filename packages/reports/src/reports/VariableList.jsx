/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Textarea, Text} from "@mantine/core";
import {format} from "pretty-format";

/* hooks */
import {useVariables} from "./hooks/blocks/useVariables";

/* css */
import "./VariableList.css";

/**
 *
 */
function VariableList({id}) {

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  const {variables, attributeKeys} = useVariables(id);
  const response = useMemo(() => block._status && block._status.response ? format(block._status.response) : false, [blocks]);

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      Variables
      <div key="vl" className="cms-block-variable-list" style={{height: 300}}>
        <ul>
          {Object.keys(variables).map(d => <li key={d}><Text size="s" style={{fontFamily: "monospace", fontWeight: attributeKeys.includes(d) ? "bold" : "normal"}}>{`${d}: ${variables[d]}`}</Text></li>)}
        </ul>
      </div>
      {response && <div key="resp">
        <Textarea size="xs" value={response} styles={{input: {fontFamily: "monospace"}}} label="API Response" minRows={17} />
      </div> }
    </div>
  );

}

export default VariableList;
