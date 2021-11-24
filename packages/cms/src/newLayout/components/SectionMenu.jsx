/* react */
import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {Modal, Menu, Button, Group} from "@mantine/core";
import {HiOutlineTrash} from "react-icons/hi";
import {MdOutlineAccountTree} from "react-icons/md";

/* redux */
import {deleteEntity} from "../../actions/profiles";

/* enums */
import {ENTITY_TYPES} from "../../utils/consts/cms";

/**
 *
 */
function SectionMenu({id, control, toggleDependencies, showDependencies}) {

  const dispatch = useDispatch();

  const [opened, setOpened] = useState(false);

  const maybeDelete = () => setOpened(true);
  const onClose = () => setOpened(false);

  const onDelete = () => {
    onClose();
    dispatch(deleteEntity(ENTITY_TYPES.SECTION, {id}));
  };

  const modalProps = {
    opened,
    title: "Are you sure?",
    onClose
  };

  return (
    <React.Fragment>
      <Menu zIndex={1001} control={control}>
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item icon={<HiOutlineTrash />} onClick={maybeDelete}>Delete</Menu.Item>
      </Menu>
      <Modal {...modalProps} key="modal">
        Are you sure you want to delete this Section and all its children? This action cannot be undone.
        <Group position="right" style={{marginTop: 10}}>
          <Button onClick={onClose}>Cancel</Button>
          <Button color="red" onClick={onDelete}>Yes, Delete it.</Button>
        </Group>
      </Modal>
    </React.Fragment>
  );

}

export default SectionMenu;
