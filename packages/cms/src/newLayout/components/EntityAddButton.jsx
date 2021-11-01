import React, {useState} from "react";
import {Button, Icon, Intent, PopoverPosition} from "@blueprintjs/core";
import {Popover2, Popover2InteractionKind} from "@blueprintjs/Popover2";

import useKeyPress from "../hooks/listeners/useKeyPress";
import slugifyInput from "../../utils/web/slugifyInput";

import {ENTITY_ADD_BUTTON_TYPES} from "./consts";

import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

/**
 *
 */
function EntityAddButton({type = ENTITY_ADD_BUTTON_TYPES.TEXT, label, onSubmit, renderTarget, urlSafe, selections = []}) {

  /* state */
  const [name, setName] = useState("");
  const [selection, setSelection] = useState(type === ENTITY_ADD_BUTTON_TYPES.SELECT && selections[0] ? selections[0].value : null);
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setName("");
    setIsOpen(false);
  };

  const onChangeText = e => {
    setName(urlSafe ? slugifyInput(e.target.value) : e.target.value);
  };

  const onChangeSelect = e => {
    setSelection(e.target.value);
  };

  const submit = () => {
    const result = type === ENTITY_ADD_BUTTON_TYPES.SELECT ? selection : name;
    onSubmit(result);
    onClose();
  };

  const ENTER_KEY = 13;
  const enterPress = useKeyPress(ENTER_KEY);
  const ready = type === ENTITY_ADD_BUTTON_TYPES.TEXT && name || type === ENTITY_ADD_BUTTON_TYPES.SELECT;
  if (isOpen && ready && enterPress) submit();

  const popoverProps = {
    isOpen,
    onClose,
    interactionKind: Popover2InteractionKind.CLICK,
    placement: PopoverPosition.AUTO
  };

  return (
    <Popover2
      {...popoverProps}
      content={<div className="cms-profile-name-box">
        <label>{label}</label>
        {type === ENTITY_ADD_BUTTON_TYPES.TEXT && <input type="text" value={name} autoFocus onChange={onChangeText} />}
        {type === ENTITY_ADD_BUTTON_TYPES.SELECT && <select autoFocus onChange={onChangeSelect} value={selection}>
          {selections.map((d, i) => <option key={i} value={d.value}>{d.label}</option>)}
        </select>}
        <Button onClick={submit} disabled={!ready}>Submit</Button>
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
