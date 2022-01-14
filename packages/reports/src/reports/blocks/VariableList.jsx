/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {Textarea} from "@mantine/core";
import {format} from "pretty-format";

/* hooks */
import {useVariables} from "../hooks/blocks/useVariables";

/* components */
import InputMenuItem from "../components/InputMenuItem";

/* css */
import "./VariableList.css";
import {BLOCK_TYPES} from "../../utils/consts/cms";


/**
 *
 */
function VariableList({id, setInlineId}) {

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  const {variablesById, attributeKeys} = useVariables(id);
  const response = useMemo(() => block._status && block._status.response ? format(block._status.response) : false, [blocks]);

  const onClick = id => {
    if (blocks[id] && blocks[id].type === BLOCK_TYPES.GENERATOR) setInlineId(id);
  };

  return (
    <div style={{display: "flex", flex: "1", flexDirection: "column"}}>
      <div
        key="vl"
        style={{
          flex: "1",
          overflowY: "scroll"
        }}
      >
        {Object.keys(variablesById).sort(a => a === "attributes" ? -1 : 1).map(vid =>
          <div key={vid} onClick={() => onClick(vid)}><InputMenuItem variables={variablesById[vid]} active={attributeKeys} /></div>
        )}
      </div>
      {response &&
        <div key="resp">
          <Textarea size="xs" value={response} styles={{input: {fontFamily: "monospace"}}} label="API Response" minRows={17} />
        </div>
      }
    </div>
  );

}

export default VariableList;
