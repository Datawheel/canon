import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Intent} from "@blueprintjs/core";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

import CMSHeader from "./CMSHeader";
import Hero from "./sections/Hero";
import Section from "./sections/Section";
import EntityAddButton from "./components/EntityAddButton";

import {newEntity, updateEntity} from "../actions/profiles";

import insertAtOrdering from "../utils/insertAtOrdering";
import {ENTITY_TYPES, SECTION_TYPES} from "../utils/consts/cms";

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

  const [sections, setSections] = useState([]);
  // const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSections(profile ? profile.sections : []);
  }, [profile]);

  const onDragEnd = result => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const id = Number(result.draggableId);
    const ordering = result.destination.index + 1;
    const payload = {id, ordering};
    // update the sections optimistically (locally) while sending the asynchronous update
    setSections(insertAtOrdering(sections, payload.id, payload.ordering));
    // setIsDragging(false);
    dispatch(updateEntity(ENTITY_TYPES.SECTION, payload));
  };

  /*
  const getStyle = style => {
    if (!isDragging) return style;
    return {
      ...style,
      height: "40px",
      overflow: "hidden"
    };
  };
  */

  const addSection = (slug, ordering) => {
    const payload = {
      profile_id: id,
      type: SECTION_TYPES.DEFAULT,
      slug,
      ordering
    };
    dispatch(newEntity(ENTITY_TYPES.SECTION, payload));
  };

  if (!profile) return <div>Loading...</div>;
  if (profile.error) return <div>{profile.error}</div>;

  const [heroSection, ...restSections] = sections;

  return (
    <div className="cms-profile">
      <CMSHeader id={id}/>
      <div className="cms-section-container">
        {heroSection && <Hero key="hero" profile={profile} section={heroSection} />}
        <EntityAddButton
          label="Section Slug"
          onSubmit={name => addSection(name, 1)}
          urlSafe={true}
          renderTarget={props => <Button {...props} className="cms-profile-add-section-button" icon="add" intent={Intent.PRIMARY} iconSize={20}/>}
        />
      </div>
      <DragDropContext /* onBeforeCapture={() => setIsDragging(true)}*/ onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {provided =>
            <div ref={provided.innerRef} {...provided.droppableProps} className="cms-droppable-container">
              {restSections.map((section, i) =>
                <Draggable key={section.id} draggableId={`${section.id}`} index={i} >
                  {(provided, snapshot) =>
                    <div
                      key={`section-${section.id}`}
                      className="cms-section-container"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      // style={getStyle(provided.draggableProps.style)}
                    >
                      <Section section={section} isDragging={snapshot.isDragging} dragHandleProps={provided.dragHandleProps}/>
                      <EntityAddButton
                        label="Section Slug"
                        urlSafe={true}
                        onSubmit={name => addSection(name, i + 2)}
                        renderTarget={props => <Button {...props} className="cms-profile-add-section-button" icon="add" intent={Intent.PRIMARY} iconSize={20}/>}
                      />
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
