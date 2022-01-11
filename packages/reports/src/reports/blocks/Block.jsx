/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Group, Tooltip} from "@mantine/core";
import {HiOutlineCode} from "react-icons/hi";

/* components */
import BlockEditor from "./BlockEditor";
import RichTextEditor from "../editors/RichTextEditor";
import AceWrapper from "../editors/AceWrapper";
import ApiInput from "../components/ApiInput";
import BlockPreview from "./BlockPreview";
import BlockSettings from "./BlockSettings";
import BlockOutputPanel from "./BlockOutputPanel";
import SimpleUI from "../editors/SimpleUI";
import ConsumerMenu from "../components/ConsumerMenu";
import VariableList from "./VariableList";

/* utils */
import deepClone from "../../utils/js/deepClone";

/* hooks */
import {useVariables} from "../hooks/blocks/useVariables";

/* redux */
import {updateEntity} from "../../actions/reports";

/* enums */
import {ENTITY_TYPES, BLOCK_MAP, BLOCK_TYPES, BLOCK_FIELDS} from "../../utils/consts/cms";
import {REQUEST_STATUS} from "../../utils/consts/redux";

const MODES = {
  UI: "ui",
  CODE: "code"
};

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
function Block({id, modified, callbacks, inline}) {

  const {setOpened, setModified, maybeCloseWithoutSaving, setInlineId} = callbacks;

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const blocks = useSelector(state => state.cms.reports.entities.blocks);

  /** Block data object from database */
  const block = blocks[id];
  // todo1.0 fix formatters, maybe move this
  const formatters = useSelector(state => state.cms.formatters);

  /**
   * The content of the entire CMS is kept in a normalized redux object called reports.
   * These redux-level props cannot be edited directly, so each of the editors (draft, ace)
   * will clone their contents on mount, and report their new states here via callbacks.
   * When the user presses save, we have access to the current blockState here, so it can
   * be persisted to psql, pulled back into redux, and redistributed as props again.
   */
  const [blockState, setBlockState] = useState(false);
  const [loading, setLoading] = useState(false);

  const {variables} = useVariables(id);

  useEffect(() => setBlockState(deepClone(block)), []);

  if (!block || !blockState) return null;

  const buildPayload = () => {
    const {settings} = blockState;
    const contentByLocale = Object.values(blockState.contentByLocale).reduce((acc, d) => ({[d.locale]: {...d, content: d.content}}), {});
    const properties = ["id", "api", "content", "shared", "type"].reduce((acc, d) => ({...acc, [d]: blockState[d]}), {});
    return {
      ...properties,
      contentByLocale,
      settings
    };
  };

  const onSave = keepWindowOpen => {
    const payload = buildPayload();
    setLoading(true);
    dispatch(updateEntity(ENTITY_TYPES.BLOCK, payload)).then(resp => {
      if (resp.status === REQUEST_STATUS.SUCCESS) {
        setModified(false);
        if (!keepWindowOpen) {
          inline ? setInlineId(null) : setOpened(false);
        }
      }
      else {
        // todo1.0 toast error
      }
      setLoading(false);
    });
  };

  /* CHANGE HANDLERS */

  const upsertLocaleContent = (content, locale) => {
    const existingContent = blockState.contentByLocale[locale] || {id, locale, content: {}};
    setBlockState({...blockState, contentByLocale: {...blockState.contentByLocale, [locale]: {...existingContent, content: {...existingContent.content, ...content}}}});
  };

  const onChangeText = (content, locale) => upsertLocaleContent(content, locale);
  const onTextModify = () => !modified && setModified(true);

  const onChangeCode = (logic, locale) => {
    if (!modified) setModified(true);
    hasNoLocaleContent(block.type)
      ? setBlockState({...blockState, content: {...blockState.content, logic}})
      : upsertLocaleContent({logic}, locale);
  };

  const onChangeSimple = (simple, logic, locale) => {
    if (!modified) setModified(true);
    hasNoLocaleContent(block.type)
      ? setBlockState({...blockState, content: {...blockState.content, simple, logic}})
      : upsertLocaleContent({simple, logic}, locale);
  };

  const onChangeMode = (mode, locale) => {
    if (!modified) setModified(true);
    const newMode = {[BLOCK_FIELDS.SIMPLE_ENABLED]: mode === MODES.UI};
    hasNoLocaleContent(block.type)
      ? setBlockState({...blockState, content: {...blockState.content, ...newMode}})
      : upsertLocaleContent(newMode, locale);
  };

  const onChangeAPI = api => {
    setBlockState({...blockState, content: {...blockState.content, api}});
  };

  const onChangeSettings = settings => {
    if (!modified) setModified(true);
    // Unlike other settings, type and shared are top-level, not stored in the settings object
    settings.type || settings.shared !== undefined
      ? setBlockState({...blockState, ...settings})
      : setBlockState({...blockState, settings: {...blockState.settings, ...settings}});
  };

  /**
   * A number of components embedded in this block need access to content here, either the ever-changing
   * blockState, or the various callbacks that change it. It is recommended here https://reactjs.org/docs/composition-vs-inheritance.html
   * to achieve this by passing these components down as props for deep embedding.
   */

  /* EDITORS TO PASS DOWN */

  /**
   * Gen/Viz/Selector editors should not re-render on every single change, as their javascript is often broken mid-keystroke.
   * Therefore, render these blocks using the static props version, which only updates on Save. Normal stat-likes
   * can update on keystroke, so the user can watch the prose change as they type.
   */
  // const usePropBlock = [BLOCK_TYPES.GENERATOR, BLOCK_TYPES.VIZ, BLOCK_TYPES.SELECTOR].includes(block.type);


  const blockPreview = <BlockPreview
    id={id}
    key="block-preview"
    active={true}
    block={block}
    blockState={blockState}
    locale={localeDefault}
    variables={variables}
    allowed={true}
    debug={true}
  />;

  const currentMode =
    blockState.type  // The editor may not yet be open, don't try to drill down until the state is cloned.
      ? (hasNoLocaleContent(blockState.type)
        ? blockState.content
        : blockState.contentByLocale[localeDefault].content)[BLOCK_FIELDS.SIMPLE_ENABLED]
        ? MODES.UI
        : MODES.CODE
      : MODES.CODE;

  const simpleState = hasNoLocaleContent(blockState.type)
    ? blockState.content?.simple
    : blockState.contentByLocale?.[localeDefault]?.content?.simple;

  const apiInput = <ApiInput
    key="api-input"
    defaultValue={block.content.api}
    onChange={onChangeAPI}
    onEnterPress={() => onSave(true)}
    variables={variables}
  />;

  /** Editor for modifying a block's JS logic directly */
  // The codeEditor is the only editor that changes *based on another editor, i.e, the simpleUI.
  // Therefore it must be controlled, and its state must live here in Block.jsx
  const codeEditor = <AceWrapper
    style={{flex: 1}}
    key="code-editor"
    onChange={logic => onChangeCode(logic, localeDefault)}
    value={blockState.type
      ? hasNoLocaleContent(blockState.type)
        ? blockState.content.logic
        : blockState.contentByLocale[localeDefault].content.logic
      : ""
    }
  />;

  const executeButton = <Button style={{minHeight: 40}} onClick={() => onSave(true)}>Save &amp; Execute</Button>;

  const isStatlike = ![BLOCK_TYPES.GENERATOR, BLOCK_TYPES.VIZ, BLOCK_TYPES.SELECTOR].includes(block.type);

  /** This is the (non-code) GUI editor for blocks that is meant for most simple cases.
   * If the block is a stat-like type, then use a rich text editor to render its forms.
   * Otherwise, a block type will need to have its own tailored Simple UI logic.
   */
  const uiEditor = isStatlike
    ? <RichTextEditor
      locale={localeDefault}
      key="text-editor"
      defaultContent={block.contentByLocale[localeDefault].content.simple || {}}
      fields={BLOCK_MAP[block.type]}
      formatters={formatters}
      variables={variables}
      onChange={onChangeText}
      onTextModify={onTextModify}
    />
    : <SimpleUI
      type={block.type}
      locale={localeDefault}
      simpleState={simpleState}
      onChange={onChangeSimple}
      executeButton={executeButton}
    />;

  const components = {blockPreview, apiInput, codeEditor, blockSettings, executeButton, uiEditor};

  const blockSettings = <BlockSettings
    id={id}
    onChange={onChangeSettings}
  />;

  const blockOutputPanel = <BlockOutputPanel
    id={id}
    components={components}
    mode={currentMode}
  />;

  const variableList = <VariableList id={id} setInlineId={setInlineId}/>;

  const panels = {blockSettings, blockOutputPanel, variableList};

  return (
    <React.Fragment>
      <BlockEditor key="be" id={id} panels={panels}/>
      <Group position="right">
        <Tooltip
          label={`${currentMode === MODES.UI ? "Show" : "Hide"} Code`}
          withArrow
          color={currentMode === MODES.CODE ? "dark" : "lime"}
        >
          <Button
            key="mode-control"
            className="cr-block-output-mode-control"
            variant={currentMode === MODES.UI ? "outline" : "filled"}
            color={currentMode === MODES.UI ? "dark" : "lime"}
            onClick={() => onChangeMode(currentMode === MODES.UI ? MODES.CODE : MODES.UI, localeDefault)}
          >
            <HiOutlineCode size={16} />
          </Button>
        </Tooltip>
        <ConsumerMenu id={id} />
        <Button key="cancel" color="red" onClick={maybeCloseWithoutSaving}>Cancel</Button>
        <Button key="save" color="green" onClick={() => onSave(false)}>Save &amp; Close</Button>
      </Group>
    </React.Fragment>
  );

}

export default Block;
