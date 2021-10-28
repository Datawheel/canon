import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Intent} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/Popover2";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

import CMSHeader from "./CMSHeader";
import Hero from "./sections/Hero";
import Section from "./sections/Section";

import {newEntity, updateEntity} from "../actions/profiles";

import {ENTITY_TYPES} from "../utils/consts/cms";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./ProfileEditor.css";

/**
 *
 */
function ProfileEditor({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault, profile} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault,
    profile: state.cms.profiles.find(d => d.id === id)
  }));

  const onDragEnd = result => {
    if (!result.destination) return;
    const payload = {id: Number(result.draggableId), ordering: result.destination.index + 1};
    dispatch(updateEntity(ENTITY_TYPES.SECTION, payload));
  };

  const addSection = ordering => {
    const payload = {
      profile_id: id,
      type: "Default",
      ordering
    };
    dispatch(newEntity(ENTITY_TYPES.SECTION, payload));
  };

  if (!profile) return <div>Loading...</div>;
  if (profile.error) return <div>{profile.error}</div>;

  const [heroSection, ...sections] = profile.sections;

  return (
    <div className="cms-profile">
      <CMSHeader />
      <div className="cms-section-container">
        <Hero key="hero" profile={profile} section={heroSection} />
        <Button className="cms-profile-add-section-button" icon="add" onClick={() => addSection(1)} intent={Intent.PRIMARY} iconSize={20}/>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {provided =>
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {sections.map((section, i) =>
                <Draggable key={section.id} draggableId={`${section.id}`} index={i}>
                  {provided =>
                    <div
                      key={`section-${i}`}
                      className="cms-section-container"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Section section={section}/>
                      <Button className="cms-profile-add-section-button" icon="add" onClick={() => addSection(i + 2)} intent={Intent.PRIMARY} iconSize={20}/>
                    </div>
                  }
                </Draggable>
              )}
              {provided.placeholder}
            </div>
          }
        </Droppable>
      </DragDropContext>
    </div>
  );

}

export default ProfileEditor;
