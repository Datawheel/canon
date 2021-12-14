/* react */
import React, {useState, useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Modal, ActionIcon, Button, Group, Tooltip, useMantineTheme} from "@mantine/core";
import {HiOutlineCog, HiOutlineLogout, HiOutlineLogin, HiOutlinePencil, HiEyeOff} from "react-icons/hi";
import {AiOutlineGlobal} from "react-icons/ai";

/* components */
import CogMenu from "../components/CogMenu";
import BlockEditor from "./BlockEditor";
import RichTextEditor from "../editors/RichTextEditor";
import AceWrapper from "../editors/AceWrapper";
import ApiInput from "../components/ApiInput";
import BlockPreview from "./BlockPreview";
import BlockSettings from "./BlockSettings";

/* utils */
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";
import sanitizeBlockContent from "../../utils/sanitizeBlockContent";
import deepClone from "../../utils/deepClone";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";
import {useVariables} from "../hooks/blocks/useVariables";

/* redux */
import {updateEntity} from "../../actions/reports";

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
function Block({id, setHoverBlock, isInput, isConsumer, active}) {

  const dispatch = useDispatch();
  const {getConfirmation} = useConfirmationDialog();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  /**
   * The content of the entire CMS is kept in a normalized redux object called reports.
   * These redux-level props cannot be edited directly, so each of the editors (draft, ace)
   * will clone their contents on mount, and report their new states here via callbacks.
   * When the user presses save, we have access to the current blockState here, so it can
   * be persisted to psql, pulled back into redux, and redistributed as props again.
   */
  const [blockState, setBlockState] = useState({});
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [modified, setModified] = useState(false);

  const {variables} = useVariables(id);

  useEffect(() => {
    if (opened) {
      setBlockState(deepClone(block));
    }
  }, [opened, block]);

  const {allowed, allowedMessage} = useMemo(() => {
    const allowed = !block?._status?.hiddenByCascade;
    const allowedMessage = block?._status?.hiddenByCascade === id
      ? `Hidden by ${block?.settings?.allowed}: ${variables[block?.settings?.allowed]}`
      : `Hidden by ${block?._status?.hiddenByCascade}`;
    return {allowed, allowedMessage};
  }, [variables, block]);

  if (!block) return null;

  const onSave = keepWindowOpen => {
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

  const maybeCloseWithoutSaving = async() => {
    if (modified) {
      const confirmed = await getConfirmation({
        title: "Close editor without saving?",
        confirmText: "Yes, abandon changes."
      });
      if (confirmed) {
        setOpened(false);
        setModified(false);
      }
    }
    else {
      setOpened(false);
      setModified(false);
    }
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
      ? setBlockState({...blockState, logic})
      : upsertLocaleContent({logic}, locale);
  };

  const onChangeAPI = api => {
    setBlockState({...blockState, api});
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
  const usePropBlock = [BLOCK_TYPES.GENERATOR, BLOCK_TYPES.VIZ, BLOCK_TYPES.SELECTOR].includes(block.type);

  const blockPreview = <BlockPreview
    id={id}
    key="block-preview"
    active={true}
    blockState={usePropBlock ? block : blockState}
    locale={localeDefault}
    variables={variables}
    allowed={true}
  />;

  const apiInput = <ApiInput
    key="api-input"
    defaultValue={block.api}
    onChange={onChangeAPI}
    onEnterPress={() => onSave(true)}
    variables={variables}
  />;

  const textEditor = <RichTextEditor
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

  const theme = useMantineTheme();

  const modalProps = {
    centered: true,
    opened,
    onClose: maybeCloseWithoutSaving,
    overflow: "inside",
    padding: theme.spacing.xl,
    size: "90%",
    title: `${upperCaseFirst(block.type)} Editor`
  };

  const cogProps = {
    id: block.id,
    type: ENTITY_TYPES.BLOCK
  };

  const hoverActions = {
    onMouseEnter: () => setHoverBlock(id),
    onMouseLeave: () => setHoverBlock(false)
  };

  return (
    <React.Fragment>
      <div key="block" className="cr-section-block" {...hoverActions} style={{padding: theme.spacing.xs}}>
        { isInput || isConsumer ? <div className={`cr-block-link ${isInput ? "input" : "consumer"}`} key="link"
          style={{
            color: isInput ? theme.colors.red[5] : theme.colors.green[5]
          }}>
          { isInput ? <HiOutlineLogout size={20} /> : <HiOutlineLogin size={20} /> }
        </div> : null }
        <BlockPreview
          style={{color: "red"}}
          key="bp"
          blockState={block}
          active={active}
          variables={variables}
          locale={localeDefault}
          allowed={allowed}
        />
        <div key="bc" className="cr-block-controls"
          style={{
            borderRadius: theme.radius.md,
            padding: theme.spacing.xs / 2,
            right: theme.spacing.xs / 2,
            top: theme.spacing.xs / 2
          }}>
          {block.shared && <Tooltip key="tt" withArrow label="Sharing: Enabled"><ActionIcon key="globe"><AiOutlineGlobal size={20} /></ActionIcon></Tooltip>}
          {!allowed && <Tooltip key="allowed" withArrow label={allowedMessage}><ActionIcon><HiEyeOff size={20} /></ActionIcon></Tooltip>}
          <ActionIcon key="edit" onClick={() => setOpened(true)}><HiOutlinePencil size={20} /></ActionIcon>
          <CogMenu key="cog"{...cogProps} id={id} control={<ActionIcon ><HiOutlineCog size={20} /></ActionIcon>} />
        </div>
      </div>
      <Modal centered key="d" {...modalProps}>
        <BlockEditor key="be" id={id} components={components}/>
        <Group position="right" style={{marginTop: theme.spacing.sm}}>
          <Button key="cancel" color="red" onClick={maybeCloseWithoutSaving}>Cancel</Button>
          <Button key="save" color="green" onClick={() => onSave(false)}>Save &amp; Close</Button>
        </Group>
      </Modal>
    </React.Fragment>
  );

}

export default Block;
