import React, {useState} from "react";
import {Button, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import CogMenu from "../CogMenu";

import {ENTITY_TYPES} from "../../utils/consts/cms";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./SectionHeader.css";

/**
 *
 */
function SectionHeader({section, dragHandleProps}) {

  /* state */
  const [showMenu, setShowMenu] = useState(false);

  const popoverProps = {
    isOpen: showMenu,
    onClose: () => setShowMenu(false),
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };


  return (
    <div className="cms-section-header">
      <Button key="b1" small={true} className="cms-section-drag-button" icon="drag-handle-horizontal" {...dragHandleProps}/>
      <span className="cms-section-header-slug">#{section.slug}</span>
      <Button key="b2" small={true} className="cms-section-edit-button" icon="edit" />
      <Popover2
        key="popover"
        {...popoverProps}
        content ={<CogMenu type={ENTITY_TYPES.SECTION} id={section.id}/>}
        renderTarget={({ref, ...targetProps}) =>
          <Button key="b3" {...targetProps} elementRef={ref} small={true} onClick={() => setShowMenu(!showMenu)} className="cms-section-cog-button" icon="cog" />
        }
      />

    </div>
  );

}

export default SectionHeader;
