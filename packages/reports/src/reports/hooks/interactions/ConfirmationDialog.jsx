import React, {useState, useContext} from "react";
import {Modal, Button, Group, useMantineTheme} from "@mantine/core";

const ConfirmationDialog = ({opened, title, message, onConfirm, onCancel, cancelText = "Cancel", confirmText = "Confirm"}) => {

  const theme = useMantineTheme();

  return (
    <Modal
      centered={true}
      zIndex={1002}
      opened={opened}
      title={title}
      onClose={onCancel}
    >
      {message}
      <Group position="right" style={{marginTop: theme.spacing.sm}}>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button color="red" onClick={onConfirm}>{confirmText}</Button>
      </Group>
    </Modal>
  );
};

const ConfirmationDialogContext = React.createContext({});

const ConfirmationDialogProvider = ({children}) => {

  const [opened, setOpened] = useState(false);
  const [config, setConfig] = useState({});

  const openDialog = ({title, message, cancelText, confirmText, actionCallback}) => {
    setOpened(true);
    setConfig({title, message, cancelText, confirmText, actionCallback});
  };

  const resetDialog = () => {
    setOpened(false);
    // The disappearing text is visually jarring - clear it out just a bit later
    setTimeout(() => setConfig({}), 200);
  };

  const onConfirm = () => {
    resetDialog();
    config.actionCallback(true);
  };

  const onCancel = () => {
    resetDialog();
    config.actionCallback(false);
  };

  return (
    <ConfirmationDialogContext.Provider value={{openDialog}}>
      <ConfirmationDialog
        opened={opened}
        title={config?.title}
        message={config?.message}
        cancelText={config?.cancelText}
        confirmText={config?.confirmText}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      {children}
    </ConfirmationDialogContext.Provider>
  );
};

const useConfirmationDialog = () => {
  const {openDialog} = useContext(ConfirmationDialogContext);

  const getConfirmation = ({...options}) =>
    new Promise(res => {
      openDialog({actionCallback: res, ...options});
    });

  return {getConfirmation};
};

export default ConfirmationDialog;
export {ConfirmationDialogProvider, useConfirmationDialog};
