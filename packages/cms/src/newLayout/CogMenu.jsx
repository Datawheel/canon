import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {Alert, Menu, MenuItem, MenuDivider, Intent} from "@blueprintjs/core";

import {deleteEntity, deleteProfile} from "../actions/profiles";

import {ENTITY_TYPES} from "../utils/consts/cms";

/**
 *
 */
function CogMenu({type, id}) {

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
    setShowAlert(false);
    if (type === ENTITY_TYPES.PROFILE) {
      dispatch(deleteProfile(id));
    }
    else {
      dispatch(deleteEntity(type, {id}));
    }
  };

  const alertProps = {
    canOutsideClickCancel: true,
    icon: "trash",
    isOpen: showAlert,
    intent: Intent.DANGER,
    confirmButtonText: `Yes, Delete ${type}`,
    onConfirm: onDelete,
    cancelButtonText: "Cancel",
    onCancel: () => setShowAlert(false)
  };

  return (
    <div className="cms-cog-actions">
      <Menu>
        <MenuItem icon="eye-open" onClick={toggleVisibility} text="Visible" />
        <MenuDivider />
        <MenuItem icon="trash" onClick={maybeDelete} text="Delete" />
      </Menu>
      <Alert {...alertProps} key="alert">
        {`Are you sure you want to delete this ${type} and all its children? This action cannot be undone.`}
      </Alert>
    </div>
  );

}

export default CogMenu;
