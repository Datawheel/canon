/* react */
import React from "react";
import {ActionIcon, Code, useMantineTheme} from "@mantine/core";
import {HiOutlineCog, HiOutlineMenuAlt4} from "react-icons/hi";

/* component */
import CogMenu from "../components/CogMenu";

/* enums */
import {ENTITY_TYPES} from "../../utils/consts/cms";

/* css */
import "./SectionHeader.css";

/**
 *
 */
function SectionHeader({active, isDragging, section, dragHandleProps}) {

  const theme = useMantineTheme();

  return (
    <div className={`cms-section-header${active || isDragging ? " active" : ""}`} style={{padding: `2px ${theme.spacing.xs}px 0`}}>
      <Code key="s1" style={{backgroundColor: "transparent"}}>#{section.slug}</Code>
      <ActionIcon key="b1" {...dragHandleProps}><HiOutlineMenuAlt4 size={16} /></ActionIcon>
      <CogMenu key="cog" type={ENTITY_TYPES.SECTION} id={section.id} control={<ActionIcon ><HiOutlineCog size={20} /></ActionIcon>} />
    </div>
  );

}

export default SectionHeader;
