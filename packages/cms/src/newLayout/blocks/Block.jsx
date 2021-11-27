/* react */
import React, {useState, useMemo, useEffect} from "react";
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
import BlockSettings from "./BlockSettings";

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
import deepClone from "../../utils/deepClone";

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
function Block({id, setHoverBlock, isInput, isConsumer, active}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const blocks = useSelector(state => state.cms.profiles.entities.blocks);
  const block = blocks[id];

  /**
   * The content of the entire CMS is kept in a normalized redux object called profiles.
   * These redux-level props cannot be edited directly, so each of the editors (draft, ace)
   * will clone their contents on mount, and report their new states here via callbacks.
   * When the user presses save, we have access to the current blockState here, so it can
   * be persisted to psql, pulled back into redux, and redistributed as props again.
   */
  const [blockState, setBlockState] = useState({});
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [alertOpened, setAlertOpened] = useState(false);
  const [modified, setModified] = useState(false);

  const variables = useMemo(() =>
    Object.values(blocks)
      .filter(d => block.inputs.includes(d.id))
      .reduce((acc, d) => ({...acc, ...d._variables}), {})
  , [blocks]);

  useEffect(() => {
    if (opened) {
      setBlockState(deepClone(block));
    }
  }, [opened, block]);

  const onCloseAll = () => {
    setOpened(false);
    setAlertOpened(false);
    setModified(false);
  };

  const onSave = keepWindowOpen => {
    console.log(blockState.logic);
    const {settings} = blockState;
    const sanitizeContentObject = content => Object.keys(content).reduce((acc, d) => ({...acc, [d]: sanitizeBlockContent(content[d])}), {});
    const contentByLocale = Object.values(blockState.contentByLocale).reduce((acc, d) => ({[d.locale]: {...d, content: sanitizeContentObject(d.content)}}), {});
    const properties = ["id", "api", "logic", "logicSimple", "logicSimpleEnabled", "shared", "type"].reduce((acc, d) => ({...acc, [d]: blockState[d]}), {});
    const payload = {
      ...properties,
      contentByLocale,
      settings
    };
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

  /* CHANGE HANDLERS */

  const upsertLocaleContent = (content, locale) => {
    const existingContent = blockState.contentByLocale[locale] || {id, locale, content: {}};
    setBlockState({...blockState, contentByLocale: {...blockState.contentByLocale, [locale]: {...existingContent, content: {...existingContent.content, ...content}}}});
  };

  const onChangeText = (content, locale) => upsertLocaleContent(content, locale);
  const onTextModify = () => !modified ? setModified(true) : null;

  const onChangeCode = (logic, locale) => {
    if (!modified) setModified(true);
    hasNoLocaleContent(block.type)
      ? setBlockState({...blockState, logic})
      : upsertLocaleContent({logic}, locale);
  };

  const onChangeAPI = e => {
    setBlockState({...blockState, api: e.target.value});
  };

  // todo1.0 this will have to be some kind of merge/spread
  const onChangeSettings = settings => {
    setBlockState({...blockState, settings: {...blockState.settings, ...settings}});
  };

  /**
   * A number of components embedded in this block need access to content here, either the ever-changing
   * blockState, or the various callbacks that change it. It is recommended here https://reactjs.org/docs/composition-vs-inheritance.html
   * to achieve this by passing these components down as props for deep embedding.
   */

  /* EDITORS TO PASS DOWN */

  const blockPreview = <BlockPreview
    id={id}
    key="block-preview"
    active={true}
    blockState={blockState}
    locale={localeDefault}
    variables={variables}
  />;

  const apiInput = <ApiInput
    key="api-input"
    defaultValue={block.api}
    onChange={onChangeAPI}
    variables={variables}
  />;

  const textEditor = <NewRichTextEditor
    locale={localeDefault}
    key="text-editor"
    defaultContent={block.contentByLocale[localeDefault].content || {}}
    fields={BLOCK_MAP[block.type]}
    variables={variables}
    onChange={onChangeText}
    onTextModify={onTextModify}
  />;

  const codeEditor = <AceWrapper
    className="cms-block-output-ace"
    key="code-editor"
    onChange={logic => onChangeCode(logic, localeDefault)}
    defaultValue={hasNoLocaleContent(block.type) ? block.logic : block.contentByLocale[localeDefault].content.logic}
  />;

  const blockSettings = <BlockSettings
    id={id}
    onChange={onChangeSettings}
  />;

  const executeButton = <Button style={{minHeight: 40}} onClick={() => onSave(true)}>Save & Execute</Button>;

  const components = {blockPreview, apiInput, textEditor, codeEditor, blockSettings, executeButton};

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
        <BlockPreview blockState={block} active={active} variables={variables} locale={localeDefault}/>
        <ActionIcon key="edit" onClick={() => setOpened(true)}><HiOutlinePencil size={20} /></ActionIcon>
        <CogMenu key="cog"{...cogProps} id={id} control={<ActionIcon ><HiOutlineCog size={20} /></ActionIcon>} />
      </div>
      <Modal key="d" {...modalProps}>
        <BlockEditor key="be" id={id} components={components}/>
        <Button onClick={() => onSave(false)}>Save &amp; Close</Button>
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
