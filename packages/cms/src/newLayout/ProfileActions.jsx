import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Menu, MenuItem} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/Popover2";

import {getProfiles, newProfile} from "../actions/profiles";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

/**
 *
 */
function ProfileActions() {

  // const dispatch = useDispatch();

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  const cancel = e => {
    e.stopPropagation();
    console.log("oy");
  };

  return (
    <div className="cms-profile-actions">
      <Menu>
        <MenuItem onClick={cancel} text="one" />
        <MenuItem onClick={cancel} text="two" />
        <MenuItem onClick={cancel} text="three" />
      </Menu>
    </div>
  );

}

export default ProfileActions;
