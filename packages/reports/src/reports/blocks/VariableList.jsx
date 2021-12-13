/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Textarea} from "@mantine/core";
import {format} from "pretty-format";

/* hooks */
import {useVariables} from "../hooks/blocks/useVariables";
import InputMenuItem from "../components/InputMenuItem";

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
    <div style={{display: "flex", flex: "1", flexDirection: "column"}}>
      <div key="vl"
        style={{
          flex: "1",
          overflowY: "scroll"
        }}>
        <InputMenuItem variables={variables} active={attributeKeys} />
      </div>
      {response && <div key="resp">
        <Textarea size="xs" value={response} styles={{input: {fontFamily: "monospace"}}} label="API Response" minRows={17} />
      </div> }
    </div>
  );

}

export default VariableList;
