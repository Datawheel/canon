import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Intent, Icon} from "@blueprintjs/core";

import SectionHeader from "./SectionHeader";
import EntityAddButton from "../components/EntityAddButton";
import Block from "../blocks/Block";

import {newEntity} from "../../actions/profiles";

import {ENTITY_ADD_BUTTON_TYPES} from "../components/consts";
import {BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";

import "./Section.css";

/**
 *
 */
function Section({id, isDragging, dragHandleProps}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault, section} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault,
    section: state.cms.profiles.entities.sections[id]
  }));

  const addBlock = type => {
    const payload = {
      type,
      section_id: section.id
    };
    dispatch(newEntity(ENTITY_TYPES.BLOCK, payload));
  };

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
          renderTarget={props => <Button {...props} className="cms-profile-add-block-button" intent={Intent.PRIMARY}><Icon icon="add" /></Button>}
        />
      </div>
    </div>
  );

}

export default Section;
