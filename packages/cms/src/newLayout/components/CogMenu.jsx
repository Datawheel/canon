import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {Alert, Menu, MenuItem, MenuDivider, Intent} from "@blueprintjs/core";

import {deleteEntity, deleteProfile} from "../../actions/profiles";

import {ENTITY_TYPES, ENTITY_PRETTY_NAMES} from "../../utils/consts/cms";

/**
 *
 */
function CogMenu({type, id}) {

  const PRETTY_NAME = ENTITY_PRETTY_NAMES[type] || "Entity";

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
    confirmButtonText: `Yes, Delete ${PRETTY_NAME}`,
    onConfirm: onDelete,
    cancelButtonText: "Cancel",
    onCancel: () => setShowAlert(false)
  };

  return (
    <React.Fragment>
      <div className="cms-cog-actions">
        <Menu>
          <MenuItem icon="eye-open" onClick={toggleVisibility} text="Visible" />
          <MenuDivider />
          <MenuItem icon="trash" onClick={maybeDelete} text="Delete" />
        </Menu>
      </div>
      <Alert {...alertProps} key="alert">
        {`Are you sure you want to delete this ${PRETTY_NAME} and all its children? This action cannot be undone.`}
      </Alert>
    </React.Fragment>
  );

}

export default CogMenu;
