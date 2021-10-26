import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/Popover2";

import {getProfiles, newProfile} from "../actions/profiles";

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

  return (
    <div className="cms-profile-card">
      <span>{label}</span>
    </div>
  );

}

export default ProfileCard;
