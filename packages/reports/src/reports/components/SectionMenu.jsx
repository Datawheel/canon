/* react */
import React from "react";
import {useDispatch} from "react-redux";
import {Menu} from "@mantine/core";
import {HiOutlineTrash} from "react-icons/hi";

/* redux */
import {deleteEntity} from "../../actions/reports";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";

/* enums */
import {ENTITY_TYPES} from "../../utils/consts/cms";

/**
 *
 */
function SectionMenu({id, control}) {

  const dispatch = useDispatch();
  const {getConfirmation} = useConfirmationDialog();

  const maybeDelete = async() => {
    const confirmed = await getConfirmation({
      title: "Are you sure?",
      message: "Are you sure you want to delete this Section and all its children? This action cannot be undone.",
      confirmText: "Yes, Delete it."
    });

    if (confirmed) dispatch(deleteEntity(ENTITY_TYPES.SECTION, {id}));
  };

  return (
    <React.Fragment>
      <Menu zIndex={1001} control={control}>
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item icon={<HiOutlineTrash />} onClick={maybeDelete}>Delete</Menu.Item>
      </Menu>
    </React.Fragment>
  );

}

export default SectionMenu;
