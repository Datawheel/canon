import React, {useState} from "react";
import {Button, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import ProfileActions from "./ProfileActions";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./ProfileCard.css";

/**
 *
 */
function ProfileCard({label}) {

  const [showMenu, setShowMenu] = useState(false);

  const popoverProps = {
    isOpen: showMenu,
    onClose: () => setShowMenu(false),
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };

  return (
    <div className="cms-profile-card">
      <span>{label}</span>
      <Popover2
        {...popoverProps}
        content ={<ProfileActions />}
        renderTarget={({ref, ...targetProps}) =>
          <Button {...targetProps} elementRef={ref} onClick={() => setShowMenu(!showMenu)} className="cms-profile-card-cog bp3-small" icon="cog" />
        }
      />
    </div>
  );

}

export default ProfileCard;
