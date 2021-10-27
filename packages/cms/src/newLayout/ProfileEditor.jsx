import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/Popover2";

import {getProfiles, newProfile} from "../actions/profiles";

import CMSHeader from "./CMSHeader";
import Hero from "./sections/Hero";


import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./ProfileEditor.css";

/**
 *
 */
function ProfileEditor({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault, profile} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault,
    profile: state.cms.profiles.find(d => d.id === id)
  }));

  if (!profile) return <div>Loading...</div>;
  if (profile.error) return <div>{profile.error}</div>;

  const [heroSection, ...sections] = profile.sections;

  return (
    <div className="cms-profile">
      <CMSHeader />
      <Hero key="hero" profile={profile} section={heroSection} />
    </div>
  );

}

export default ProfileEditor;
