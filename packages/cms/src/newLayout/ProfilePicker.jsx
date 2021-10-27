import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Icon, Intent, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import ProfileCard from "./ProfileCard";

import useKeyPress from "./hooks/listeners/useKeyPress";

import {newProfile} from "../actions/profiles";
import {setStatus} from "../actions/status";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./ProfilePicker.css";

/**
 *
 */
function ProfilePicker() {

  const dispatch = useDispatch();

  /* redux */
  const {profiles, localeDefault} = useSelector(state => ({
    profiles: state.cms.profiles,
    localeDefault: state.cms.status.localeDefault
  }));

  /* state */
  const [profileName, setProfileName] = useState("");
  const [submitOpen, setSubmitOpen] = useState(false);

  const onClose = () => {
    setProfileName("");
    setSubmitOpen(false);
  };

  const submit = () => {
    onClose();
    dispatch(newProfile({label: profileName}));
  };

  const openProfile = id => {
    dispatch(setStatus({pathObj: {profile: id}}));
  };

  const ENTER_KEY = 13;
  const enterPress = useKeyPress(ENTER_KEY);
  if (submitOpen && profileName && enterPress) submit();

  const popoverProps = {
    isOpen: submitOpen,
    onClose,
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };

  return (
    <div className="cms-profile-picker">
      <h1>Profiles</h1>
      <ul>
        {profiles.map(profile =>
          <li className="cms-profile-li" key={`profile${profile.id}`} >
            <button className="cms-card-cover-button" onClick={() => openProfile(profile.id)} >
              <span className="u-visually-hidden">open</span>
            </button>
            <ProfileCard id={profile.id} label={profile.contentByLocale[localeDefault].content.label} />
          </li>
        )}
        <li>
          <Popover2
            {...popoverProps}
            content={<div className="cms-profile-name-box">
              <label>Profile Name</label>
              <input type="text" value={profileName} autoFocus onChange={e => setProfileName(e.target.value)} />
              <Button onClick={submit} disabled={!profileName}>Submit</Button>
            </div>}
            renderTarget={({ref, ...targetProps}) =>
              <Button {...targetProps} elementRef={ref} onClick={() => setSubmitOpen(true)} className="cms-profile-new-button" intent={Intent.PRIMARY}><Icon icon="add" iconSize={40} /></Button>
            }
          />

        </li>
      </ul>
    </div>
  );

}

export default ProfilePicker;
