import React from "react";
import {ActionIcon, Code, useMantineTheme} from "@mantine/core";
import {HiOutlineCog, HiOutlineMenuAlt4} from "react-icons/hi";

import CogMenu from "../components/CogMenu";

import {ENTITY_TYPES} from "../../utils/consts/cms";

import "./SectionHeader.css";

/**
 *
 */
function SectionHeader({active, isDragging, section, dragHandleProps}) {

  const theme = useMantineTheme();

  return (
    <div className={`cms-section-header${active || isDragging ? " active" : ""}`} style={{padding: `0 ${theme.spacing.xs}px`}}>
      <Code key="s1" style={{backgroundColor: "transparent"}}>#{section.slug}</Code>
      {/* todo1.0 - for some reason neither an html button nor a mantine button can accept these dragHandleProps - need to revisit why */}
      {/* <span key="b1" className="cms-section-drag-button">drag</span> */}
      <ActionIcon key="b1" {...dragHandleProps}><HiOutlineMenuAlt4 size={16} /></ActionIcon>
      <CogMenu key="cog" type={ENTITY_TYPES.SECTION} id={section.id} control={<ActionIcon ><HiOutlineCog size={20} /></ActionIcon>} />
    </div>
  );

}

export default SectionHeader;
