/* react */
import React, {useState, useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Badge, Center, Overlay, useMantineTheme} from "@mantine/core";
import {HiPlusCircle} from "react-icons/hi";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

/* components */
import SectionHeader from "./SectionHeader";
import EntityAddButton from "../components/EntityAddButton";
import Block from "../blocks/Block";
import {settings as blockSettings} from "../blocks/BlockSettings";

/* redux */
import {newEntity, activateSection, updateEntity} from "../../actions/reports";

/* consts */
import {ENTITY_ADD_BUTTON_TYPES} from "../components/consts";
import {BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";
import {REQUEST_STATUS} from "../../utils/consts/redux";

/* css */
import "./Section.css";
import {setStatus} from "../../actions/status";

/**
 *
 */
function Section({id, isDragging, dragHandleProps}) {

  const dispatch = useDispatch();

  /* redux */
  const section = useSelector(state => state.cms.reports.entities.sections[id]);
  const blocks = useSelector(state => state.cms.reports.entities.blocks);

  const [hoverBlock, setHoverBlock] = useState();

  const {inputs, consumers} = useMemo(() => {
    if (hoverBlock) {
      const block = blocks[hoverBlock];
      const {inputs, consumers} = block;
      return {inputs, consumers};
    }
    else {
      return {inputs: [], consumers: []};
    }
  }, [hoverBlock]);

  const [active, setActive] = useState(false);

  const addBlock = (blockcol, type) => {
    const payload = {
      blockcol,
      type,
      section_id: section.id
    };
    dispatch(newEntity(ENTITY_TYPES.BLOCK, payload));
  };

  const onActivate = () => {
    dispatch(activateSection(id)).then(resp => {
      if (resp.status === REQUEST_STATUS.SUCCESS) {
        dispatch(setStatus({activeSection: id}));
        setActive(true);
      }
      else {
        // todo1.0 toast error
      }
    });
  };

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const columns = Object.values(blocks || {}).filter(d => d.section_id === id).sort((a, b) => a.blockrow - b.blockrow).reduce((acc, d) => {
      if (!acc[String(d.blockcol)]) {
        acc[String(d.blockcol)] = {items: [{id: String(d.id)}]};
      }
      else {
        acc[String(d.blockcol)].items.push({id: String(d.id)});
      }
      return acc;
    }, {});
    setColumns(columns);
  }, [blocks]);

  if (!section) return null;

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const {source, destination} = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

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
      blockrow: Number(destination.index),
      blockcol: Number(destination.droppableId)
    };
    dispatch(updateEntity(ENTITY_TYPES.BLOCK, payload));
  };

  const theme = useMantineTheme();

  return (
    <div className={`cms-section${isDragging || active ? " active" : ""}`}>
      <div className="cms-section-content"
        style={{
          alignItems: "stretch",
          display: "flex",
          padding: theme.spacing.xl,
          position: "relative",
          zIndex: "0"
        }}
      >
        <DragDropContext
          onDragEnd={result => onDragEnd(result, columns, setColumns)}
        >
          {Object.entries(columns).map(([columnId, column], index) => {

            const staticWidths = column.items
              .map(({id}) => parseFloat(blocks[id].settings.width))
              .filter(d => !isNaN(d));

            return <div
              className="cms-section-column"
              style={{
                flex: "1 1 100%",
                maxWidth: staticWidths.length ? Math.max(...staticWidths) : "none",
                padding: theme.spacing.sm
              }}
              key={columnId}
            >
              <Droppable droppableId={columnId} key={columnId}>
                {(provided, snapshot) =>
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      alignContent: "flex-start",
                      background: snapshot.isDraggingOver
                        ? theme.colors[theme.primaryColor][0]
                        : "inherit",
                      display: "flex",
                      flexDirection: column.items.find(item => blocks[item.id].settings.display === "inline") ? "row" : "column",
                      flexWrap: column.items.find(item => blocks[item.id].settings.display === "inline") ? "wrap" : "nowrap",
                      height: "100%"
                    }}
                  >
                    {column.items.map((item, index) => {
                      const {settings, type} = blocks[item.id];

                      return <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) =>  //eslint-disable-line
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              alignSelf: type === BLOCK_TYPES.VIZ ? "stretch" : "flex-start",
                              boxShadow: snapshot.isDragging ? theme.shadows.lg : "none",
                              flex: type === BLOCK_TYPES.VIZ ? "1 1 100%"
                                : settings.display === "inline" ? "1 1 auto" : "0 0 auto",
                              margin: "0",
                              textAlign: settings.align || blockSettings.align.defaultValue,
                              width: settings.width && settings.width !== "stretch" ? parseFloat(settings.width) : settings.display === "inline" ? "auto" : "100%"
                            }}
                          >
                            <Block
                              id={Number(item.id)}
                              key={`block-${item.id}`}
                              active={active}
                              isInput={inputs.includes(Number(item.id))}
                              isConsumer={consumers.includes(Number(item.id))}
                              setHoverBlock={setHoverBlock}/>
                          </div>
                        }
                      </Draggable>;
                    })}
                    {active && <EntityAddButton
                      type={ENTITY_ADD_BUTTON_TYPES.SELECT}
                      label="Block Type"
                      onSubmit={value => addBlock(index, value)}
                      selections={Object.values(BLOCK_TYPES).map(d => ({label: d, value: d}))}
                      target={<ActionIcon size="md" radius="lg"><HiPlusCircle size={20} /></ActionIcon>}
                    />}
                    {provided.placeholder}
                  </div>
                }
              </Droppable>
            </div>;
          })}
        </DragDropContext>
        {active && <EntityAddButton
          type={ENTITY_ADD_BUTTON_TYPES.SELECT}
          label="Block Type"
          onSubmit={value => addBlock(Object.keys(columns).length, value)}
          selections={Object.values(BLOCK_TYPES).map(d => ({label: d, value: d}))}
          target={<ActionIcon size="md" radius="lg"><HiPlusCircle size={20} /></ActionIcon>}
        />}
        {!active && <Center className="cms-section-click-to-edit" style={{bottom: "0", position: "absolute", width: "100%", left: "0", top: "0"}}>
          <Badge size="xl" variant="outline" color="gray">Click to Edit</Badge>
        </Center>}
        {!active && <Overlay className="cms-section-overlay" onClick={onActivate} color={theme.black} opacity={0.5} style={{cursor: "pointer"}} />}
      </div>
      <SectionHeader active={active} section={section} isDragging={isDragging} dragHandleProps={dragHandleProps}/>
    </div>
  );

}

export default Section;
