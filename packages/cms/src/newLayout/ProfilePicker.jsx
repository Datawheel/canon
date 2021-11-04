import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Icon, Intent} from "@blueprintjs/core";

import ProfileCard from "./ProfileCard";
import EntityAddButton from "./components/EntityAddButton";

import {newProfile} from "../actions/profiles";

import "./ProfilePicker.css";

/**
 *
 */
function ProfilePicker() {

  const dispatch = useDispatch();

  /* redux */
  const {profiles, localeDefault} = useSelector(state => ({
    profiles: state.cms.profiles.result,
    localeDefault: state.cms.status.localeDefault
  }));

  return (
    <div className="cms-profile-picker">
      <h1>Profiles</h1>
      <ul>
        {profiles.map(profile =>
          <li className="cms-profile-li" key={`profile-${profile}`} >
            <ProfileCard id={profile} />
          </li>
        )}
        <li>
          <EntityAddButton
            label="Profile Name"
            onSubmit={name => dispatch(newProfile({label: name}))}
            renderTarget={props => <Button {...props} className="cms-profile-new-button" intent={Intent.PRIMARY}><Icon icon="add" iconSize={40} /></Button>}
          />
        </li>
      </ul>
    </div>
  );

}

export default ProfilePicker;
