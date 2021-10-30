import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Dialog} from "@blueprintjs/core";

import SettingsCog from "../SettingsCog";
import CogMenu from "../CogMenu";
import BlockEditor from "../BlockEditor";

import upperCaseFirst from "../../utils/formatters/upperCaseFirst";

import {ENTITY_TYPES} from "../../utils/consts/cms";

import "./Block.css";

/**
 *
 */
function Block({block}) {

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  /* redux */
  const {localeDefault} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault
  }));

  /* mount */
  useEffect(() => {
    // todo1.0 load background images
    // todo1.0 reimplement titlesearch click
  }, []);

  const onClick = e => {
    e.stopPropagation();
    setIsOpen(true);
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

  return (
    <div className="cms-section-block" onClick={onClick}>
      <div className="cms-section-block-header">{block.type}</div>
      <div className="cms-block-cog">
        <SettingsCog
          content={<CogMenu type={ENTITY_TYPES.BLOCK} id={block.id} />}
          renderTarget={props => <Button {...props} key="b3" className="cms-block-cog-button" small={true} icon="cog" />}
        />
      </div>
      <Dialog {...dialogProps}>
        <BlockEditor block={block} />
      </Dialog>
    </div>
  );

}

export default Block;
