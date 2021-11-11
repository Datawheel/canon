/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Dialog} from "@blueprintjs/core";

/* components */
import SettingsCog from "../SettingsCog";
import CogMenu from "../components/CogMenu";
import BlockEditor from "../BlockEditor";
import BlockEditorFooter from "../components/BlockEditorFooter";
import NewRichTextEditor from "../editors/NewRichTextEditor";
import AceWrapper from "../../components/editors/AceWrapper";

/* utils */
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";
import sanitizeBlockContent from "../../utils/sanitizeBlockContent";

/* redux */
import {updateEntity} from "../../actions/profiles";

/* enums */
import {ENTITY_TYPES, BLOCK_MAP, BLOCK_TYPES} from "../../utils/consts/cms";
import {REQUEST_STATUS} from "../../utils/consts/redux";

/* css */
import "./Block.css";

/**
 * A block can be either a true block, or an input to another block.
 * To help redux access the proper normalized array, map their psql name to their redux name
 */
const LOOKUP_MAP = {
  block: "blocks",
  block_input: "inputs"
};

/**
 * Most blocks have translatable content, and store their locale-specific copies in a content table.
 * Generators and vizes are the exception - they store their one & only version directly in the psql block.
 */
const hasNoLocaleContent = type => [BLOCK_TYPES.GENERATOR, BLOCK_TYPES.VIZ].includes(type);

/**
 * A Block is a visual element of any kind embedded in a Section. It can be a stat,
 * selector, or anything listed in BLOCK_TYPES.
 * id - the id for this block
 * entity - BLOCK (clickable, editable) or BLOCK_INPUT (uneditable - feeds another block)
 */
function Block({id, entity}) {

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  /* redux */
  const {localeDefault, block} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault,
    block: state.cms.profiles.entities[LOOKUP_MAP[entity]][id]
  }));

  if (!block) return null;

  /**
   * The content of the entire CMS is kept in a normalized redux object called profiles.
   * These redux-level props cannot be edited directly, so each of the editors (draft, ace)
   * will clone their contents on mount, and report their new states here via callbacks.
   * When the user presses save, we have access to the current stateContent here, so it can
   * be persisted to psql, pulled back into redux, and redistributed as props again.
   */
  const [stateContent, setStateContent] = useState({});
  const [loading, setLoading] = useState(false);

  const onClick = () => {
    if (entity === ENTITY_TYPES.BLOCK) setIsOpen(true);
  };

  const onSave = () => {
    let payload;
    if (hasNoLocaleContent(block.type)) {
      payload = {
        id: block.id,
        api: stateContent.api,
        logic: stateContent.logic
      };
      console.log(payload);
    }
    else {
      // Remove draftjs html cruft and leading/trailing spaces from all content fields
      const content = Object.keys(stateContent).reduce((acc, d) => ({...acc, [d]: sanitizeBlockContent(stateContent[d])}), {});
      payload = {
        id: block.id,
        content: [{
          id: block.id,
          locale: localeDefault,
          content
        }]
      };
    }
    setLoading(true);
    dispatch(updateEntity(ENTITY_TYPES.BLOCK, payload)).then(resp => {
      if (resp.status === REQUEST_STATUS.SUCCESS) {
        setIsOpen(false);
      }
      else {
        // todo1.0 toast error
      }
      setLoading(false);
    });
  };

  const maybeCloseEditorWithoutSaving = () => {

  };

  const onChangeText = content => {
    setStateContent({...stateContent, ...content});
  };

  const onChangeCode = logic => {
    console.log(logic);
    setStateContent({...stateContent, logic});
  };

  const textEditor = <NewRichTextEditor
    locale={localeDefault}
    block={block}
    fields={BLOCK_MAP[block.type]}
    onChange={onChangeText}
  />;

  const codeEditor = <AceWrapper
    className="cms-block-output-ace"
    // ref={comp => this.editor = comp}
    onChange={onChangeCode}
    // todo1.0 how to handle/scaffold missing content here?
    defaultValue={block && block.contentByLocale ? block.contentByLocale[localeDefault].content.logic : ""}
    // {...this.props}
  />;

  const editors = {textEditor, codeEditor};

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
        <BlockEditor id={id} editors={editors}/>
        <BlockEditorFooter onSave={onSave}/>
      </Dialog>
    </React.Fragment>
  );

}

export default Block;
