import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Dialog} from "@blueprintjs/core";

import SettingsCog from "../SettingsCog";
import CogMenu from "../components/CogMenu";
import BlockEditor from "../BlockEditor";

import upperCaseFirst from "../../utils/formatters/upperCaseFirst";

import {ENTITY_TYPES} from "../../utils/consts/cms";

import "./Block.css";

/**
 *
 */
function Block({block, type}) {

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  const onClick = () => {
    if (type === ENTITY_TYPES.BLOCK) setIsOpen(true);
  };

  const save = () => {
    console.log("save");
  };

  const maybeCloseEditorWithoutSaving = () => {

  };

  const dialogProps = {
    className: "cms-block-editor-dialog",
    title: `${upperCaseFirst(block.type)} editor`,
    isOpen,
    // onClose: this.maybeCloseEditorWithoutSaving.bind(this),
    onClose: () => setIsOpen(false)
    // onDelete: this.maybeDelete.bind(this),
    // onSave: this.save.bind(this)
  };

  const cogProps = {
    type,
    id: type === ENTITY_TYPES.BLOCK_INPUT ? block.block_input.id : block.id
  };

  return (
    <React.Fragment>
      <div className="cms-section-block" >
        <div key="bh" className="cms-section-block-header">{block.type}({block.id})</div>
        {type === ENTITY_TYPES.BLOCK && <Button className="cms-block-edit-button" onClick={onClick} icon="edit" small={true} /> }
        <SettingsCog
          content={<CogMenu {...cogProps} />}
          renderTarget={props => <Button {...props} key="b3" className="cms-block-cog-button" small={true} icon="cog" />}
        />
      </div>
      <Dialog key="d" {...dialogProps}>
        <BlockEditor block={block} />
      </Dialog>
    </React.Fragment>
  );

}

export default Block;
