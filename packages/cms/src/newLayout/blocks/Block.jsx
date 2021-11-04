import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Dialog, Classes, Intent} from "@blueprintjs/core";

import SettingsCog from "../SettingsCog";
import CogMenu from "../components/CogMenu";
import BlockEditor from "../BlockEditor";
import BlockEditorFooter from "../components/BlockEditorFooter";
import NewRichTextEditor from "../editors/NewRichTextEditor";

import upperCaseFirst from "../../utils/formatters/upperCaseFirst";
import sanitizeBlockContent from "../../utils/sanitizeBlockContent";

import {updateEntity} from "../../actions/profiles";

import {ENTITY_TYPES, BLOCK_MAP} from "../../utils/consts/cms";

import "./Block.css";


/**
 * A Block is a visual element of any kind embedded in a Section. It can be a stat,
 * selector, or anything listed in BLOCK_TYPES.
 * block - the data for this block
 * entity - BLOCK (clickable, editable) or BLOCK_INPUT (uneditable - feeds another block)
 */
function Block({block, entity}) {

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  /* redux */
  const {localeDefault, justUpdated} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault,
    justUpdated: state.cms.status.justUpdated
  }));

  console.log(justUpdated);

  const [stateContent, setStateContent] = useState({});

  const onClick = () => {
    if (entity === ENTITY_TYPES.BLOCK) setIsOpen(true);
  };

  const onSave = () => {
    const content = Object.keys(stateContent).reduce((acc, d) => ({...acc, [d]: sanitizeBlockContent(stateContent[d])}), {});
    const payload = {
      id: block.id,
      content: [{
        id: block.id,
        locale: localeDefault,
        content
      }]
    };
    dispatch(updateEntity(ENTITY_TYPES.BLOCK, payload));
  };

  const maybeCloseEditorWithoutSaving = () => {

  };

  const onChange = content => {
    setStateContent({...stateContent, ...content});
  };

  const textEditor = <NewRichTextEditor
    locale={localeDefault}
    block={block}
    fields={BLOCK_MAP[block.type]}
    onChange={onChange}
  />;

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
    type: entity,
    // The action cog needs an entity type and an id to perform actions on.
    // If this is a BLOCK, then its just the id - but if it's a BLOCK_INPUT, then
    // a *subscription* to a block is being deleted, and must use that id instead.
    id: entity === ENTITY_TYPES.BLOCK_INPUT ? block.block_input.id : block.id
  };

  return (
    <React.Fragment>
      <div className="cms-section-block" >
        <div key="bh" className="cms-section-block-header">{block.type}({block.id})</div>
        {entity === ENTITY_TYPES.BLOCK && <Button className="cms-block-edit-button" onClick={onClick} icon="edit" small={true} /> }
        <SettingsCog
          content={<CogMenu {...cogProps} />}
          renderTarget={props => <Button {...props} key="b3" className="cms-block-cog-button" small={true} icon="cog" />}
        />
      </div>
      <Dialog key="d" {...dialogProps}>
        <BlockEditor block={block} textEditor={textEditor}/>
        <BlockEditorFooter onSave={onSave}/>
      </Dialog>
    </React.Fragment>
  );

}

export default Block;
