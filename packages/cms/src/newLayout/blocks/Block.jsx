/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Modal, ActionIcon, Button, Group} from "@mantine/core";
import {HiOutlineCog, HiOutlinePencil} from "react-icons/hi";

/* components */
import CogMenu from "../components/CogMenu";
import BlockEditor from "../BlockEditor";
import NewRichTextEditor from "../editors/NewRichTextEditor";
import AceWrapper from "../../components/editors/AceWrapper";
import ApiInput from "../components/ApiInput";
import BlockPreview from "./BlockPreview";

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
 * Most blocks have translatable content, and store their locale-specific copies in a content table.
 * Generators and vizes are the exception - they store their one & only version directly in the psql block.
 */
const hasNoLocaleContent = type => [BLOCK_TYPES.GENERATOR, BLOCK_TYPES.VIZ].includes(type);

/**
 * A Block is a visual element of any kind embedded in a Section. It can be a stat, generator,
 * selector, or anything listed in BLOCK_TYPES.
 * id - the id for this block
 */
function Block({id, setHoverBlock, isInput, isConsumer}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.profiles.entities.blocks[id]);

  /**
   * The content of the entire CMS is kept in a normalized redux object called profiles.
   * These redux-level props cannot be edited directly, so each of the editors (draft, ace)
   * will clone their contents on mount, and report their new states here via callbacks.
   * When the user presses save, we have access to the current stateContent here, so it can
   * be persisted to psql, pulled back into redux, and redistributed as props again.
   */
  const [stateContent, setStateContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [alertOpened, setAlertOpened] = useState(false);
  const [modified, setModified] = useState(false);

  if (!block) return null;

  const onCloseAll = () => {
    setOpened(false);
    setAlertOpened(false);
    setModified(false);
  };

  const onSave = keepWindowOpen => {
    // remove logicEnabled from the post - it is currently set directly when the mode is changed in BlockOutput.
    const {logicEnabled, ...restStateContent} = stateContent; //eslint-disable-line
    let payload;
    // Blocks and Vizes, which are not locale-specific, save their data directly on the block, not in a content table.
    if (hasNoLocaleContent(block.type)) {
      payload = {
        id: block.id,
        ...restStateContent
      };
    }
    else {
      // Remove draftjs html cruft and leading/trailing spaces from all content fields
      const content = Object.keys(restStateContent).reduce((acc, d) => ({...acc, [d]: sanitizeBlockContent(restStateContent[d])}), {});
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
        setModified(false);
        if (!keepWindowOpen) {
          setOpened(false);
        }
      }
      else {
        // todo1.0 toast error
      }
      setLoading(false);
    });
  };

  const maybeCloseEditorWithoutSaving = () => modified ? setAlertOpened(true) : setOpened(false);

  const onChangeText = content => {
    setStateContent({...stateContent, ...content});
  };

  const onTextModify = () => !modified ? setModified(true) : null;

  const onChangeCode = logic => {
    if (!modified) setModified(true);
    setStateContent({...stateContent, logic});
  };

  const onChangeAPI = e => {
    setStateContent({...stateContent, api: e.target.value});
  };

  /**
   * A number of components embedded in this block need access to content here, either the ever-changing
   * stateContent, or the various callbacks that change it. It is recommended here https://reactjs.org/docs/composition-vs-inheritance.html
   * to achieve this by passing these components down as props for deep embedding.
   */

  const blockPreview = <BlockPreview
    id={id}
    key="block-preview"
    stateContent={stateContent}
  />;

  const apiInput = <ApiInput
    key="api-input"
    defaultValue={block.api}
    onChange={onChangeAPI}
  />;

  const textEditor = <NewRichTextEditor
    locale={localeDefault}
    key="text-editor"
    block={block}
    fields={BLOCK_MAP[block.type]}
    onChange={onChangeText}
    onTextModify={onTextModify}
  />;

  const codeEditor = <AceWrapper
    className="cms-block-output-ace"
    key="code-editor"
    onChange={onChangeCode}
    defaultValue={hasNoLocaleContent(block.type) ? block.logic : block.contentByLocale[localeDefault].content.logic}
  />;

  const executeButton = <Button style={{minHeight: 40}} onClick={() => onSave(true)}>Save & Execute</Button>;

  const components = {textEditor, codeEditor, apiInput, blockPreview, executeButton};

  const modalProps = {
    title: `${upperCaseFirst(block.type)} editor`,
    size: "70%",
    opened,
    onClose: maybeCloseEditorWithoutSaving
  };

  const alertProps = {
    title: "Close without saving?",
    opened: alertOpened,
    onClose: () => setAlertOpened(false)
  };

  const cogProps = {
    id: block.id,
    type: ENTITY_TYPES.BLOCK
  };

  const hoverActions = {
    onMouseEnter: () => setHoverBlock(id),
    onMouseLeave: () => setHoverBlock(false)
  };

  const overlayStyle = {width: "100%", height: "100%", position: "absolute", opacity: 0.3, zIndex: 5, textAlign: "center"};

  const inputOverlay = <div style={{...overlayStyle, backgroundColor: "lightgreen"}} key="input" ><span style={{fontSize: 60}}>INPUT</span></div>;
  const consumerOverlay = <div style={{...overlayStyle, backgroundColor: "lightblue"}} key="input" ><span style={{fontSize: 60}}>CONSUMER</span></div>;

  return (
    <React.Fragment>
      <div className="cms-section-block" {...hoverActions}>
        {isInput && inputOverlay}
        {isConsumer && consumerOverlay}
        <div key="bh" className="cms-section-block-header">{block.type}({block.id})</div>
        <ActionIcon key="edit" onClick={() => setOpened(true)}><HiOutlinePencil size={20} /></ActionIcon>
        <CogMenu key="cog"{...cogProps} id={id} control={<ActionIcon ><HiOutlineCog size={20} /></ActionIcon>} />
      </div>
      <Modal key="d" {...modalProps}>
        <BlockEditor key="be" id={id} components={components}/>
        <Button onClick={() => onSave(false)}>Save & Close</Button>
      </Modal>
      <Modal {...alertProps} key="alert">
        <Group position="right" style={{marginTop: 10}}>
          <Button onClick={() => setAlertOpened(false)}>Cancel</Button>
          <Button color="red" onClick={onCloseAll}>Yes, abandon changes.</Button>
        </Group>
      </Modal>
    </React.Fragment>
  );

}

export default Block;
