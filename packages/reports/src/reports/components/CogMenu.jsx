/* react */
import React from "react";
import {useDispatch} from "react-redux";
import {Menu} from "@mantine/core";
import {HiOutlineTrash, HiOutlineEye} from "react-icons/hi";

/* redux */
import {deleteEntity} from "../../actions/reports";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";

/* enums */
import {ENTITY_PRETTY_NAMES} from "../../utils/consts/cms";

/**
 *
 */
function CogMenu({type, id, control}) {

  const PRETTY_NAME = ENTITY_PRETTY_NAMES[type] || "Entity";

  const dispatch = useDispatch();
  const {getConfirmation} = useConfirmationDialog();

  const toggleVisibility = () => {
    console.log("todo1.0 vis switch");
  };

  const maybeDelete = async() => {
    const confirmed = await getConfirmation({
      title: "Are you sure?",
      message: `Delete this ${PRETTY_NAME} and all its contents? This action cannot be undone.`,
      confirmText: "Yes, Delete it."
    });
    if (confirmed) dispatch(deleteEntity(type, {id}));
  };

  return (
    <React.Fragment>
      <Menu zIndex={1001} control={control}>
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item icon={<HiOutlineEye />} onClick={toggleVisibility}>Visible</Menu.Item>
        <Menu.Item icon={<HiOutlineTrash />} onClick={maybeDelete}>Delete</Menu.Item>
      </Menu>
    </React.Fragment>
  );

}

export default CogMenu;
