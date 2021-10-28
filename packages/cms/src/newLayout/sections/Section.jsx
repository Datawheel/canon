import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import CogMenu from "../CogMenu";

import {ENTITY_TYPES} from "../../utils/consts/cms";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./Section.css";

/**
 *
 */
function Section({section, isDragging, dragHandleProps}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  /* mount */
  useEffect(() => {
    // todo1.0 load background images
    // todo1.0 reimplement titlesearch click
  }, []);

  /* state */
  const [showMenu, setShowMenu] = useState(false);

  const popoverProps = {
    isOpen: showMenu,
    onClose: () => setShowMenu(false),
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };

  return (
    <div className={`cms-section${isDragging ? " isDragging" : ""}`}>
      <div className="cms-section-header">
        <Button key="b1" className="cms-section-drag-button" icon="drag-handle-horizontal" {...dragHandleProps}/>
        <Button key="b2" className="cms-section-edit-button" icon="edit" />
        <Popover2
          key="popover"
          {...popoverProps}
          content ={<CogMenu type={ENTITY_TYPES.SECTION} id={section.id}/>}
          renderTarget={({ref, ...targetProps}) =>
            <Button key="b3" {...targetProps} elementRef={ref} onClick={() => setShowMenu(!showMenu)} className="cms-section-cog-button" icon="cog" />
          }
        />

      </div>
      <h1 key="h1">section {section.id}</h1>
      <h2 key="h2">ordering {section.ordering}</h2>
    </div>
  );

}

export default Section;
