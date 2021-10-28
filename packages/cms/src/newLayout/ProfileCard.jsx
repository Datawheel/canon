import React, {useState} from "react";
import {Button, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import CogMenu from "./CogMenu";

import {ENTITY_TYPES} from "../utils/consts/cms";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./ProfileCard.css";

/**
 *
 */
function ProfileCard({id, label}) {

  const [showMenu, setShowMenu] = useState(false);

  const popoverProps = {
    isOpen: showMenu,
    onClose: () => setShowMenu(false),
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };

  return (
    <div className="cms-profile-card">
      <span key="label">{label}</span>
      <Popover2
        key="popover"
        {...popoverProps}
        content ={<CogMenu type={ENTITY_TYPES.PROFILE} id={id}/>}
        renderTarget={({ref, ...targetProps}) =>
          <Button {...targetProps} elementRef={ref} onClick={() => setShowMenu(!showMenu)} className="cms-profile-card-cog bp3-small" icon="cog" />
        }
      />
    </div>
  );

}

export default ProfileCard;
