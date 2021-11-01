import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import CogMenu from "./components/CogMenu";

import {setStatus} from "../actions/status";

import {ENTITY_TYPES} from "../utils/consts/cms";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./ProfileCard.css";

/**
 *
 */
function ProfileCard({id, label}) {

  const dispatch = useDispatch();

  const [showMenu, setShowMenu] = useState(false);

  const openProfile = id => {
    dispatch(setStatus({pathObj: {profile: id}}));
  };

  const popoverProps = {
    isOpen: showMenu,
    onClose: () => setShowMenu(false),
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };

  return (
    <div className="cms-profile-card">
      <span key="label">{label}</span>
      <Button className="cms-profile-card-edit" small={true} icon="edit" onClick={() => openProfile(id)} />
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
