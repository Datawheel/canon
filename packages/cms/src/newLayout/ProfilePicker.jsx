import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/Popover2";

import ProfileCard from "./ProfileCard";

import {getProfiles, newProfile} from "../actions/profiles";

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

  return (
    <div className="cms-profile-picker">
      <h1>Profiles</h1>
      <ul>
        {profiles.map(profile =>
          <li key={`profile${profile.id}`}>{<ProfileCard id={profile.id} label={profile.contentByLocale[localeDefault].content.label} />}</li>)
        }
        <li>
          <Popover2
            interactionKind="click"
            placement="auto"
            content={<div className="cms-profile-name-box">
              <label>Profile Name</label>
              <input type="text" value={profileName} autoFocus onChange={e => setProfileName(e.target.value)} />
              <Button onClick={submit} disabled={!profileName}>Submit</Button>
            </div>}
            renderTarget={({ref, ...targetProps}) =>
              <Button {...targetProps} elementRef={ref} className="cms-profile-new-button" intent="primary" icon="add" />
            }
          />

        </li>
      </ul>
    </div>
  );

}

export default ProfilePicker;
