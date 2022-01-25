/* react */
import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import {ActionIcon, Divider, Textarea, Tooltip} from "@mantine/core";
import {format} from "pretty-format";
import {HiOutlineCog} from "react-icons/hi";
import {titleCase} from "d3plus-text";

/* hooks */
import {useVariables} from "../hooks/blocks/useVariables";

/* components */
import InputMenuItem from "../components/InputMenuItem";

/* consts */
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

  console.log(Object.keys(variablesById).map(vid => blocks[vid]));
  return (
    <div style={{display: "flex", flex: "1", flexDirection: "column"}}>
      <div
        key="vl"
        style={{
          flex: "1",
          overflowY: "scroll"
        }}
      >
        {
          Object.keys(variablesById)
            .sort(a => a === "attributes" ? -1 : 1)
            .map(vid => {

              const block = blocks[vid];
              const isGenerator = block && block.type === BLOCK_TYPES.GENERATOR;

              return (
                <div key={vid} className="cr-variable-group" style={{position: "relative"}}>
                  <Divider
                    label={block ? titleCase(block.type) : "Dimension Attributes"}
                    labelPosition="center"
                  />
                  <InputMenuItem variables={variablesById[vid]} reserved={attributeKeys} />
                  { isGenerator
                    ? <Tooltip
                      disabled={!isGenerator}
                      label="Edit this Generator"
                      style={{position: "absolute", right: 0, top: 0}}
                      transition="pop"
                      withArrow
                    >
                      <ActionIcon size="xs" onClick={() => setInlineId(vid)} variant="filled">
                        <HiOutlineCog />
                      </ActionIcon>
                    </Tooltip>
                    : null}
                </div>
              );

            })
        }
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
