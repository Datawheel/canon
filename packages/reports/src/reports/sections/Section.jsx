/* react */
import React, {useState, useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Badge, Center, Overlay, useMantineTheme} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {useNotifications} from "@mantine/notifications";
import {HiPlusCircle} from "react-icons/hi";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

/* components */
import SectionHeader from "./SectionHeader";
import EntityAddButton from "../components/EntityAddButton";
import BlockElement from "../blocks/BlockElement";

/* redux */
import {newEntity, activateSection, updateEntity} from "../../actions/reports";

/* consts */
import {ENTITY_ADD_BUTTON_TYPES} from "../components/consts";
import {BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";
import {REQUEST_STATUS} from "../../utils/consts/redux";
import blockSettings from "../../utils/settings/block";
import siteSettings from "../../utils/settings/site";

/* css */
import "./Section.css";

/**
 *
 */
function Section({id, isDragging, dragHandleProps}) {

  const dispatch = useDispatch();
  const notifications = useNotifications();

  /* redux */
  const section = useSelector(state => state.cms.reports.entities.sections[id]);
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const active = useSelector(state => state.cms.status?.activeSection === id);

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
        notifications.showNotification({
          title: "Success!",
          message: "Section Activated",
          color: "green"
        });
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
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  return (
    <div className={`cms-section${isDragging || active ? " active" : ""}`}
      style={{
        backgroundColor: siteSettings.section.backgroundColor,
        borderRadius: siteSettings.section.borderRadius,
        boxShadow: siteSettings.section.boxShadow,
        margin: `${siteSettings.section.margin}px ${siteSettings.section.margin}px 0`,
        overflow: "hidden",
        width: `calc(100% - ${siteSettings.section.margin * 2}px)`
      }}>
      <div className="cms-section-content"
        style={{
          alignItems: "stretch",
          display: "flex",
          flexDirection: smallScreen ? "column" : "row",
          padding: siteSettings.section.padding,
          position: "relative",
          zIndex: "0"
        }}
      >
        <DragDropContext
          onDragEnd={result => onDragEnd(result, columns, setColumns)}
        >
          {Object.entries(columns).map(([columnId, column], index) => {

            const staticWidths = column.items
              .map(({id}) => parseFloat(blocks[id]?.settings?.width))
              .filter(d => !isNaN(d));

            return <div
              className="cms-section-column"
              style={{
                flex: "1 1 100%",
                maxWidth: staticWidths.length ? Math.max(...staticWidths) : "none",
                padding: siteSettings.column.padding
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
                      flexDirection: column.items.find(item => blocks[item.id]?.settings?.display === "inline") ? "row" : "column",
                      flexWrap: column.items.find(item => blocks[item.id]?.settings?.display === "inline") ? "wrap" : "nowrap",
                      height: "100%"
                    }}
                  >
                    {column.items.map((item, index) => {
                      // After a block is deleted, there is a quick render moment when there is no block, and therefore
                      // no settings to access. todo1.0 Audit the render loop and find a smarter way to protect against this
                      if (!blocks[item.id]) return null;
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
                              flex: type === BLOCK_TYPES.VIZ ? smallScreen ? "1 1 300px" : "1 1 100%"
                                : settings.display === "inline" ? "1 1 auto" : "0 0 auto",
                              margin: "0",
                              textAlign: settings.align || blockSettings.align.defaultValue,
                              width: settings.width && settings.width !== "stretch" ? parseFloat(settings.width) : settings.display === "inline" ? "auto" : "100%"
                            }}
                          >
                            <BlockElement
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
        {!active && <Overlay
          className="cms-section-overlay"
          onClick={onActivate}
          color={theme.black}
          opacity={0.5}
          style={{
            cursor: "pointer"
          }}
        />}
      </div>
      <SectionHeader active={active} section={section} isDragging={isDragging} dragHandleProps={dragHandleProps}/>
    </div>
  );

}

export default Section;
