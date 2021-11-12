/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Center} from "@mantine/core";
import {HiOutlinePlusCircle} from "react-icons/hi";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

/* components */
import CMSHeader from "./CMSHeader";
import Hero from "./sections/Hero";
import Section from "./sections/Section";
import EntityAddButton from "./components/EntityAddButton";

/* redux */
import {newEntity, updateEntity} from "../actions/profiles";

/* utils */
import insertAtOrdering from "../utils/insertAtOrdering";

/* enums */
import {ENTITY_TYPES, SECTION_TYPES} from "../utils/consts/cms";

/* css */
import "./ProfileEditor.css";

/**
 *
 */
function ProfileEditor({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault, profile} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault,
    profile: state.cms.profiles.entities.profiles[id]
  }));

  if (!profile) return null;

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
    dispatch(updateEntity(ENTITY_TYPES.SECTION, payload));
  };

  const addSection = (slug, ordering) => {
    const payload = {
      profile_id: id,
      type: SECTION_TYPES.DEFAULT,
      slug,
      ordering
    };
    dispatch(newEntity(ENTITY_TYPES.SECTION, payload));
  };

  if (profile.error) return <div>{profile.error}</div>;

  // todo1.0 - maybe filter this by the sections that exist to avoid draghandle race condition
  const [heroSection, ...restSections] = sections;

  return (
    <div className="cms-profile">
      <CMSHeader id={profile.id}/>
      <div className="cms-section-container">
        {heroSection && <Hero key="hero" id={heroSection} />}
        <Center>
          <EntityAddButton
            label="Section Slug"
            onSubmit={name => addSection(name, 1)}
            urlSafe={true}
            target={<ActionIcon variant="filled" color="blue" radius="xl" className="cms-profile-add-section-button"><HiOutlinePlusCircle size={30} /></ActionIcon>}
          />
        </Center>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {provided =>
            <div ref={provided.innerRef} {...provided.droppableProps} className="cms-droppable-container">
              {restSections.map((section, i) =>
                <Draggable key={section} draggableId={`${section}`} index={i} >
                  {(provided, snapshot) =>
                    <div
                      key={`section-${section}`}
                      className="cms-section-container"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Section id={section} isDragging={snapshot.isDragging} dragHandleProps={provided.dragHandleProps}/>
                      <Center>
                        <EntityAddButton
                          label="Section Slug"
                          urlSafe={true}
                          onSubmit={name => addSection(name, i + 2)}
                          target={<ActionIcon variant="filled" color="blue" className="cms-profile-add-section-button" radius="xl" ><HiOutlinePlusCircle size={30} /></ActionIcon>}
                        />
                      </Center>
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
