/* react */
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon} from "@mantine/core";
import {HiOutlinePlusCircle} from "react-icons/hi";

/* components */
import SectionHeader from "./SectionHeader";
import EntityAddButton from "../components/EntityAddButton";
import Block from "../blocks/Block";

/* redux */
import {newEntity} from "../../actions/profiles";

/* consts */
import {ENTITY_ADD_BUTTON_TYPES} from "../components/consts";
import {BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";

/* css */
import "./Section.css";

/**
 *
 */
function Section({id, isDragging, dragHandleProps}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const section = useSelector(state => state.cms.profiles.entities.sections[id]);

  const addBlock = type => {
    const payload = {
      type,
      section_id: section.id
    };
    dispatch(newEntity(ENTITY_TYPES.BLOCK, payload));
  };

  if (!section) return null;

  const {blocks} = section;

  return (
    <div className={`cms-section${isDragging ? " isDragging" : ""}`}>
      <SectionHeader section={section} dragHandleProps={dragHandleProps}/>
      <div className="cms-section-content">
        {blocks.map(block =>
          <Block id={block} key={`block-${block}`} entity={ENTITY_TYPES.BLOCK} />
        )}
        <EntityAddButton
          type={ENTITY_ADD_BUTTON_TYPES.SELECT}
          label="Block Type"
          onSubmit={value => addBlock(value)}
          selections={Object.values(BLOCK_TYPES).map(d => ({label: d, value: d}))}
          target={<ActionIcon size="xl" radius="xl"><HiOutlinePlusCircle size={30} /></ActionIcon>}
        />
      </div>
    </div>
  );

}

export default Section;
