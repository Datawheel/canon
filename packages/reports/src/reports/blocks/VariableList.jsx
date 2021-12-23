/* react */
import React, {useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {Textarea, Popover} from "@mantine/core";
import {format} from "pretty-format";

/* hooks */
import {useVariables} from "../hooks/blocks/useVariables";

/* components */
import GeneratorOutputInline from "./GeneratorOutputInline";
import InputMenuItem from "../components/InputMenuItem";

/* css */
import "./VariableList.css";
import {BLOCK_TYPES} from "../../utils/consts/cms";


/**
 *
 */
function VariableList({id}) {

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  const [currentGen, setCurrentGen] = useState();

  const {variablesById, attributeKeys} = useVariables(id);
  const response = useMemo(() => block._status && block._status.response ? format(block._status.response) : false, [blocks]);

  const onClick = id => {
    if (currentGen) {
      setCurrentGen(null);
    }
    else {
      if (blocks[id] && blocks[id].type === BLOCK_TYPES.GENERATOR) setCurrentGen(id);
    }
  };

  const onClose = () => setCurrentGen(null);

  const popoverProps = {
    zIndex: 1001, // Over Mantine Modal's 1000
    opened: currentGen,
    onClose,
    position: "right-start"
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
        <Popover
          withArrow
          {...popoverProps}
          target={
            <div>
              {Object.keys(variablesById).sort(a => a === "attributes" ? -1 : 1).map(vid =>
                <div key={vid} onClick={() => onClick(vid)}><InputMenuItem variables={variablesById[vid]} active={attributeKeys} /></div>
              )}
            </div>
          }
        >
          <GeneratorOutputInline id={currentGen} onClose={onClose}/>
        </Popover>
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
