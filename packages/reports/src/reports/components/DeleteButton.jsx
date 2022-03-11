/* react */
import React from "react";
import {useDispatch} from "react-redux";
import {ActionIcon} from "@mantine/core";
import {HiOutlineTrash} from "react-icons/hi";

/* redux */
import {deleteEntity} from "../../actions/reports";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";

/* enums */
import {ENTITY_PRETTY_NAMES} from "../../utils/consts/cms";

/**
 *
 */
function DeleteButton({type, id}) {

  const PRETTY_NAME = ENTITY_PRETTY_NAMES[type] || "Entity";

  const dispatch = useDispatch();
  const {getConfirmation} = useConfirmationDialog();

  const maybeDelete = async() => {
    const confirmed = await getConfirmation({
      title: "Are you sure?",
      message: `Delete this ${PRETTY_NAME} and all its contents? This action cannot be undone.`,
      confirmText: "Yes, Delete it."
    });
    if (confirmed) dispatch(deleteEntity(type, {id}));
  };

  return <ActionIcon color="red" onClick={maybeDelete}>
    <HiOutlineTrash size={20} />
  </ActionIcon>;

}

export default DeleteButton;
