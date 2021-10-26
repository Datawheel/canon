import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Icon, Intent, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import ProfileCard from "./ProfileCard";

import {getProfiles, newProfile} from "../actions/profiles";
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

  /* mount */
  useEffect(() => {
    dispatch(getProfiles());
  }, []);

  /* state */
  const [profileName, setProfileName] = useState("");

  const submit = () => {
    dispatch(newProfile({label: profileName}));
  };

  const openProfile = id => {
    dispatch(setStatus({pathObj: {profile: id}}));
  };

  return (
    <div className="cms-profile-picker">
      <h1>Profiles</h1>
      <ul>
        {profiles.map(profile =>
          <li key={`profile${profile.id}`} onClick={() => openProfile(profile.id)} >
            <ProfileCard id={profile.id} label={profile.contentByLocale[localeDefault].content.label} />
          </li>
        )}
        <li>
          <Popover2
            interactionKind={Popover2InteractionKind.CLICK}
            placement={PopoverPosition.AUTO}
            content={<div className="cms-profile-name-box">
              <label>Profile Name</label>
              <input type="text" value={profileName} autoFocus onChange={e => setProfileName(e.target.value)} />
              <Button onClick={submit} disabled={!profileName}>Submit</Button>
            </div>}
            renderTarget={({ref, ...targetProps}) =>
              <Button {...targetProps} elementRef={ref} className="cms-profile-new-button" intent={Intent.PRIMARY}><Icon icon="add" iconSize={40} /></Button>
            }
          />

        </li>
      </ul>
    </div>
  );

}

export default ProfilePicker;
