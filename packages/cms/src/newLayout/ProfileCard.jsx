import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import {getProfiles, newProfile} from "../actions/profiles";

import ProfileActions from "./ProfileActions";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./ProfileCard.css";

/**
 *
 */
function ProfileCard({id, label}) {

  // const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  const [showMenu, setShowMenu] = useState(false);


  const toggleMenu = e => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };


  return (
    <div className="cms-profile-card">
      <span>{label}</span>
      <Popover2
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        interactionKind={Popover2InteractionKind.CLICK}
        placement={PopoverPosition.AUTO}
        content={<ProfileActions />}
        renderTarget={({ref, ...targetProps}) =>
          <Button {...targetProps} elementRef={ref} onClick={toggleMenu} className="cms-profile-card-cog bp3-small" icon="cog" />
        }
      />
    </div>
  );

}

export default ProfileCard;
