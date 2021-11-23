/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, AppShell, Center, useMantineTheme} from "@mantine/core";
import {HiPlusCircle} from "react-icons/hi";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

/* components */
import CMSHeader from "./CMSHeader";
import Section from "./sections/Section";
import EntityAddButton from "./components/EntityAddButton";

/* redux */
import {newEntity, updateEntity} from "../actions/profiles";

/* utils */
import insertAtOrdering from "../utils/insertAtOrdering";

/* enums */
import {ENTITY_TYPES} from "../utils/consts/cms";

/* css */
import "./ProfileEditor.css";

/**
 *
 */
function ProfileEditor({id}) {

  const dispatch = useDispatch();

  /* redux */
  const profile = useSelector(state => state.cms.profiles.entities.profiles[id]);

  const [sections, setSections] = useState([]);
  // const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSections(profile ? profile.sections : []);
  }, [profile]);

  const onDragEnd = result => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const id = Number(result.draggableId);
    const ordering = result.destination.index;
    const payload = {id, ordering};
    // update the sections optimistically (locally) while sending the asynchronous update
    setSections(insertAtOrdering(sections, payload.id, payload.ordering));
    dispatch(updateEntity(ENTITY_TYPES.SECTION, payload));
  };

  const addSection = (slug, ordering) => {
    const payload = {
      profile_id: id,
      slug,
      ordering
    };
    dispatch(newEntity(ENTITY_TYPES.SECTION, payload));
  };

  if (!profile) return null;
  if (profile.error) return <div>{profile.error}</div>;

  const theme = useMantineTheme();

  return (
    <AppShell
      padding="0"
      header={<CMSHeader id={profile.id} />}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {provided =>
            <div ref={provided.innerRef} {...provided.droppableProps} className="cms-droppable-container">
              {sections.map((section, i) =>
                <Draggable key={section} draggableId={`${section}`} index={i}>
                  {(provided, snapshot) =>
                    <div
                      key={`section-${section}`}
                      className="cms-section-container"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        boxShadow: snapshot.isDragging ? theme.shadows.sm : "none"
                      }}
                    >
                      <Section id={section} isDragging={snapshot.isDragging} dragHandleProps={provided.dragHandleProps}/>
                      <Center className="cms-section-controls">
                        <EntityAddButton
                          label="Section Slug"
                          urlSafe={true}
                          onSubmit={name => addSection(name, i + 1)}
                          target={<ActionIcon color="theme" size="md" radius="lg" style={{boxShadow: theme.shadows.xs}}><HiPlusCircle size={20} /></ActionIcon>}
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
    </AppShell>
  );

}

export default ProfileEditor;
