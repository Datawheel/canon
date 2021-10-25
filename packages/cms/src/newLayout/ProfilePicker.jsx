import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/Popover2";

import {getProfiles, newProfile} from "../actions/profiles";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./ProfilePicker.css";

/**
 *
 */
function ProfilePicker() {

  const dispatch = useDispatch();

  /* redux */
  const {profiles} = useSelector(state => ({
    profiles: state.cms.profiles
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
    <div className="cms-profile-browser">
      <h1>Profiles</h1>
      <ul>
        {profiles.map(profile =>
          <li key={`profile${profile.id}`}>{JSON.stringify(profile.content[0].content.label)}</li>)
        }
        <li>
          <Popover2
            interactionKind="click"
            placement="right"
            content={<div className="cms-profile-name-box">
              <label>Profile Name</label>
              <input type="text" value={profileName} autoFocus onChange={e => setProfileName(e.target.value)} />
              <Button onClick={submit} disabled={!profileName}>Submit</Button>
            </div>}
            renderTarget={({ref, ...targetProps}) =>
              <Button {...targetProps} elementRef={ref} intent="primary" text="New Profile" />
            }
          />

        </li>
      </ul>
    </div>
  );

}

export default ProfilePicker;
