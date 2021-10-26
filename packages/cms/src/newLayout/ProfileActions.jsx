import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Alert, Button, Menu, MenuItem, MenuDivider, Intent} from "@blueprintjs/core";
import {Popover2, Classes} from "@blueprintjs/Popover2";

import {deleteProfile} from "../actions/profiles";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

/**
 *
 */
function ProfileActions({id}) {

  const dispatch = useDispatch();

  const [showAlert, setShowAlert] = useState(null);

  const toggleVisibility = e => {
    e.stopPropagation();
    console.log("todo1.0 vis switch");
  };

  const maybeDelete = e => {
    e.stopPropagation();
    setShowAlert(true);
  };

  const onDelete = () => {
    setShowAlert(false),
    dispatch(deleteProfile(id));
  };

  const alertProps = {
    canOutsideClickCancel: true,
    icon: "trash",
    isOpen: showAlert,
    intent: Intent.DANGER,
    confirmButtonText: "Yes, Delete Profile",
    onConfirm: onDelete,
    cancelButtonText: "Cancel",
    onCancel: () => setShowAlert(false)
  };

  return (
    <div className="cms-profile-actions">
      <Menu>
        <MenuItem icon="eye-open" onClick={toggleVisibility} text="Visible" />
        <MenuDivider />
        <MenuItem icon="trash" onClick={maybeDelete} text="Delete" />
      </Menu>
      <Alert {...alertProps} key="alert">
        Are you sure you want to delete this profile and all its children? This action cannot be undone.
      </Alert>
    </div>
  );

}

export default ProfileActions;
