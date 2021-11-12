/* react */
import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {Modal, Menu, Button, Group} from "@mantine/core";
import {HiOutlineTrash, HiOutlineEye} from "react-icons/hi";

/* redux */
import {deleteEntity, deleteProfile} from "../../actions/profiles";

/* enums */
import {ENTITY_TYPES, ENTITY_PRETTY_NAMES} from "../../utils/consts/cms";

/**
 *
 */
function CogMenu({type, id, control}) {

  const PRETTY_NAME = ENTITY_PRETTY_NAMES[type] || "Entity";

  const dispatch = useDispatch();

  const [opened, setOpened] = useState(false);

  const toggleVisibility = () => {
    console.log("todo1.0 vis switch");
  };

  const maybeDelete = () => setOpened(true);
  const onClose = () => setOpened(false);

  const onDelete = () => {
    onClose();
    if (type === ENTITY_TYPES.PROFILE) {
      dispatch(deleteProfile(id));
    }
    else {
      dispatch(deleteEntity(type, {id}));
    }
  };

  const modalProps = {
    opened,
    title: "Are you sure?",
    overlayColor: "red",
    overlayOpacity: 0.1,
    onClose
  };

  return (
    <React.Fragment>
      <Menu control={control}>
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item icon={<HiOutlineEye />} onClick={toggleVisibility}>Visible</Menu.Item>
        <Menu.Item icon={<HiOutlineTrash />} onClick={maybeDelete}>Delete</Menu.Item>
      </Menu>
      <Modal {...modalProps} key="modal">
        {`Are you sure you want to delete this ${PRETTY_NAME} and all its children? This action cannot be undone.`}
        <Group position="right" style={{marginTop: 10}}>
          <Button color="blue" onClick={onClose}>Cancel</Button>
          <Button color="red" onClick={onDelete}>Yes, Delete it.</Button>
        </Group>
      </Modal>
    </React.Fragment>
  );

}

export default CogMenu;
