/* react */
import React from "react";
import {useSelector} from "react-redux";
import {ActionIcon} from "@mantine/core";
import {HiOutlineCog} from "react-icons/hi";

/* components */
import CogMenu from "../components/CogMenu";

/* css */
import "./Block.css";
import {ENTITY_TYPES} from "../../utils/consts/cms";

/**
 *
 */
function BlockInput({id}) {

  /* redux */
  const block = useSelector(state => state.cms.profiles.entities.inputs[id]);

  const cogProps = {
    id: block.block_input.id,
    type: ENTITY_TYPES.BLOCK_INPUT
  };

  return (
    <React.Fragment>
      <div className="cms-section-block" >
        <div key="bh" className="cms-section-block-header">{block.type}({block.id})</div>
        <CogMenu key="cog"{...cogProps} control={<ActionIcon ><HiOutlineCog size={20} /></ActionIcon>} />
      </div>
    </React.Fragment>
  );

}

export default BlockInput;
