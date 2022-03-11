/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, AppShell, Center, useMantineTheme} from "@mantine/core";
import {HiPlusCircle} from "react-icons/hi";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

/* components */
import CMSHeader from "./CMSHeader";
import Section from "../sections/Section";

/* redux */
import {newEntity, updateEntity} from "../../actions/reports";

/* utils */
import {insertAtOrdering} from "../../utils/js/arrayUtils";
import siteSettings from "../../utils/settings/site";

/* enums */
import {ENTITY_TYPES} from "../../utils/consts/cms";

/* css */
import "./ReportEditor.css";

/**
 *
 */
function ReportEditor({id}) {

  const dispatch = useDispatch();

  /* redux */
  const report = useSelector(state => state.cms.reports.entities.reports[id]);

  const [sections, setSections] = useState([]);
  // const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSections(report ? report.sections : []);
  }, [report]);

  const onDragEnd = result => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const id = Number(result.draggableId);
    const ordering = result.destination.index;
    const payload = {id, ordering};
    // update the sections optimistically (locally) while sending the asynchronous update
    setSections(insertAtOrdering(sections, payload.id, payload.ordering));
    dispatch(updateEntity(ENTITY_TYPES.SECTION, payload));
  };

  const addSection = ordering => {
    const payload = {
      report_id: id,
      ordering
    };
    dispatch(newEntity(ENTITY_TYPES.SECTION, payload));
  };

  if (!report) return null;
  if (report.error) return <div>{report.error}</div>;

  const theme = useMantineTheme();

  return (
    <AppShell
      header={<CMSHeader id={report.id} />}
      padding="0"
      styles={{main: {backgroundColor: siteSettings.backgroundColor}}}
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
                      className={`cms-section-container${snapshot.isDragging ? " isDragging" : ""}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        boxShadow: snapshot.isDragging ? theme.shadows.sm : undefined
                      }}
                    >
                      <Section id={section} isDragging={snapshot.isDragging} dragHandleProps={provided.dragHandleProps}/>
                      <Center className="cms-section-controls">
                        <ActionIcon onClick={() => addSection(i + 1)} color="theme" size="md" radius="lg" style={{boxShadow: theme.shadows.xs}}><HiPlusCircle size={20} /></ActionIcon>
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

export default ReportEditor;
