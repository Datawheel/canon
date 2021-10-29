import React, {useState} from "react";
import {Button, Icon, Intent, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import useKeyPress from "../hooks/listeners/useKeyPress";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

/**
 *
 */
function EntityAddButton({label, onSubmit, renderTarget, urlSafe}) {

  /* state */
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setName("");
    setIsOpen(false);
  };

  const onChange = e => {
    setName(urlSafe ? urlPrep(e.target.value) : e.target.value);
  };

  const submit = () => {
    onClose();
    onSubmit(name);
  };

  const ENTER_KEY = 13;
  const enterPress = useKeyPress(ENTER_KEY);
  if (isOpen && name && enterPress) submit();

  const popoverProps = {
    isOpen,
    onClose,
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };

  // Strip leading/trailing spaces and URL-breaking characters
  const urlPrep = str => str.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");

  return (
    <Popover2
      {...popoverProps}
      content={<div className="cms-profile-name-box">
        <label>{label}</label>
        <input type="text" value={name} autoFocus onChange={onChange} />
        <Button onClick={submit} disabled={!name}>Submit</Button>
      </div>}
      renderTarget={({ref, ...targetProps}) =>
        renderTarget
          ? renderTarget({...targetProps, elementRef: ref, onClick: () => setIsOpen(true)})
          : <Button {...targetProps} elementRef={ref} onClick={() => setIsOpen(true)} intent={Intent.PRIMARY}><Icon icon="add" /></Button>
      }
    />

  );

}

export default EntityAddButton;
