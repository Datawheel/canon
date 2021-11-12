import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Group} from "@mantine/core";
import {HiOutlinePlusCircle} from "react-icons/hi";

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
      <Group>
        {profiles.map(profile =>
          <ProfileCard key={profile} id={profile} />
        )}
        <EntityAddButton
          label="Profile Name"
          onSubmit={name => dispatch(newProfile({label: name}))}
          target={<ActionIcon variant="filled" color="blue" radius="xl" className="cms-profile-new-button"><HiOutlinePlusCircle size={30} /></ActionIcon>}
        />
      </Group>
    </div>
  );

}

export default ProfilePicker;
