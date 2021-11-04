import React, {useState} from "react";
import {Button, Classes, Icon, Intent} from "@blueprintjs/core";

import {ENTITY_ADD_BUTTON_TYPES} from "./consts";

/**
 *
 */
function BlockEditorFooter({onSave}) {

  return (
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button onClick={onSave} intent={Intent.PRIMARY}>Save</Button>
      </div>
    </div>
  );

}

export default BlockEditorFooter;
