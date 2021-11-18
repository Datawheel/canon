import React, {useState} from "react";
import {ActionIcon, Group} from "@mantine/core";
import {HiOutlineCog, HiOutlinePencil} from "react-icons/hi";

import CogMenu from "../components/CogMenu";

import {ENTITY_TYPES} from "../../utils/consts/cms";

import "./SectionHeader.css";

/**
 *
 */
function SectionHeader({section, onEdit, dragHandleProps}) {

  /* state */

  return (
    <div className="cms-section-header">
      <Group>
        {/* todo1.0 - for some reason neither an html button nor a mantine button can accept these dragHandleProps - need to revisit why */}
        <span key="b1" className="cms-section-drag-button" {...dragHandleProps}>drag</span>
        <span key="s1" className="cms-section-header-slug">#{section.slug}</span>
        <ActionIcon onClick={onEdit}><HiOutlinePencil size={20} /></ActionIcon>
        <CogMenu key="cog" type={ENTITY_TYPES.SECTION} id={section.id} control={<ActionIcon ><HiOutlineCog size={20} /></ActionIcon>} />
      </Group>
    </div>
  );

}

export default SectionHeader;
