import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Intent} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/Popover2";

import CMSHeader from "./CMSHeader";
import Hero from "./sections/Hero";
import Section from "./sections/Section";

import {newEntity} from "../actions/profiles";

import {ENTITY_TYPES} from "../utils/consts/cms";

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

  const addSection = ordering => {
    const payload = {
      profile_id: id,
      type: "Default",
      ordering
    };
    dispatch(newEntity(ENTITY_TYPES.SECTION, payload));
  };

  if (!profile) return <div>Loading...</div>;
  if (profile.error) return <div>{profile.error}</div>;

  const [heroSection, ...sections] = profile.sections;

  return (
    <div className="cms-profile">
      <CMSHeader />
      <div className="cms-section-container">
        <Hero key="hero" profile={profile} section={heroSection} />
        <Button className="cms-profile-add-section-button" icon="add" onClick={() => addSection(1)} intent={Intent.PRIMARY} iconSize={20}/>
      </div>
      {sections.map((section, i) =>
        <div key={`section-${i}`} className="cms-section-container">
          <Section section={section}/>
          <Button className="cms-profile-add-section-button" icon="add" onClick={() => addSection(i + 2)} intent={Intent.PRIMARY} iconSize={20}/>
        </div>
      )}
    </div>
  );

}

export default ProfileEditor;
