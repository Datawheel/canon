/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon} from "@mantine/core";
import {HiOutlinePlusCircle} from "react-icons/hi";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

/* components */
import SectionHeader from "./SectionHeader";
import EntityAddButton from "../components/EntityAddButton";
import Block from "../blocks/Block";

/* redux */
import {newEntity, activateSection, updateEntity} from "../../actions/profiles";

/* consts */
import {ENTITY_ADD_BUTTON_TYPES} from "../components/consts";
import {BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";
import {REQUEST_STATUS} from "../../utils/consts/redux";

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
  const blocks = useSelector(state => state.cms.profiles.entities.blocks);

  const [active, setActive] = useState(false);

  const addBlock = (column, type) => {
    const payload = {
      column,
      type,
      section_id: section.id
    };
    dispatch(newEntity(ENTITY_TYPES.BLOCK, payload));
  };

  const onEdit = () => {
    dispatch(activateSection(id)).then(resp => {
      if (resp.status === REQUEST_STATUS.SUCCESS) {
        setActive(true);
      }
      else {
        // todo1.0 toast error
      }
    });
  };

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const columns = Object.values(blocks || {}).filter(d => d.section_id === id).sort((a, b) => a.row - b.row).reduce((acc, d) => {
      if (!acc[String(d.column)]) {
        acc[String(d.column)] = {items: [{id: String(d.id)}]};
      }
      else {
        acc[String(d.column)].items.push({id: String(d.id)});
      }
      return acc;
    }, {});
    setColumns(columns);
  }, [blocks]);

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const {source, destination} = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });

    }
    else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
    const payload = {
      id: Number(result.draggableId),
      row: Number(destination.index),
      column: Number(destination.droppableId)
    };
    dispatch(updateEntity(ENTITY_TYPES.BLOCK, payload));
  };



  return (
    <div className={`cms-section${isDragging ? " isDragging" : ""}`}>
      <SectionHeader onEdit={onEdit} section={section} dragHandleProps={dragHandleProps}/>
      <div className="cms-section-content">
        {!active && <h1 onClick={onEdit} style={{position: "absolute", cursor: "pointer", backgroundColor: "white", marginTop: 150, outline: "1px solid black", textAlign: "center", width: "100%", zIndex: 2}}>Click to activate</h1>}
        <DragDropContext
          onDragEnd={result => onDragEnd(result, columns, setColumns)}
        >
          {Object.entries(columns).map(([columnId, column], index) =>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflowY: "auto",
                height: "500px"
              }}
              key={columnId}
            >
              <div style={{margin: 8}}>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) =>
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        background: snapshot.isDraggingOver
                          ? "lightblue"
                          : "lightgrey",
                        padding: 4,
                        width: 210,
                        minHeight: 500
                      }}
                    >
                      {column.items.map((item, index) =>
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided, snapshot) =>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style
                              }}
                            >
                              <Block id={Number(item.id)} active={active} key={`block-${item.id}`} entity={ENTITY_TYPES.BLOCK} />
                            </div>
                          }
                        </Draggable>
                      )}
                      <EntityAddButton
                        type={ENTITY_ADD_BUTTON_TYPES.SELECT}
                        label="Block Type"
                        onSubmit={value => addBlock(index, value)}
                        selections={Object.values(BLOCK_TYPES).map(d => ({label: d, value: d}))}
                        target={<ActionIcon size="xl" radius="xl"><HiOutlinePlusCircle size={30} /></ActionIcon>}
                      />
                      {provided.placeholder}
                    </div>
                  }
                </Droppable>
              </div>
            </div>
          )}
        </DragDropContext>
        <EntityAddButton
          type={ENTITY_ADD_BUTTON_TYPES.SELECT}
          label="Block Type"
          onSubmit={value => addBlock(Object.keys(columns).length, value)}
          selections={Object.values(BLOCK_TYPES).map(d => ({label: d, value: d}))}
          target={<ActionIcon size="xl" radius="xl"><HiOutlinePlusCircle size={30} /></ActionIcon>}
        />
      </div>
    </div>
  );

}

export default Section;
