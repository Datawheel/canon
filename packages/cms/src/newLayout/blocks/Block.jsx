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
function Block({block, mode}) {

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

  const onClick = () => {
    if (mode !== "input") setIsOpen(true);
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
    type: mode === "input" ? ENTITY_TYPES.BLOCK_INPUT : ENTITY_TYPES.BLOCK,
    id: block.id
  };

  return (
    <React.Fragment>
      <div className="cms-section-block" onClick={onClick}>
        <div key="bh" className="cms-section-block-header">{block.type}</div>
        <div key="bc" className="cms-block-cog">
          <SettingsCog
            content={<CogMenu {...cogProps} />}
            renderTarget={props => <Button {...props} key="b3" className="cms-block-cog-button" small={true} icon="cog" />}
          />
        </div>

      </div>
      <Dialog key="d" {...dialogProps}>
        <BlockEditor block={block} />
      </Dialog>
    </React.Fragment>
  );

}

export default Block;
