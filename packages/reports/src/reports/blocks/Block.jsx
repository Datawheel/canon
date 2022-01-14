/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Group, Tooltip} from "@mantine/core";
import {HiOutlineCode} from "react-icons/hi";

/* components */
import BlockEditor from "./BlockEditor";
import ConsumerMenu from "../components/ConsumerMenu";

/* utils */
import deepClone from "../../utils/js/deepClone";

/* hooks */
import {useBlock} from "../hooks/blocks/selectors";

/* redux */
import {updateEntity} from "../../actions/reports";

/* enums */
import {ENTITY_TYPES, BLOCK_FIELDS} from "../../utils/consts/cms";
import {REQUEST_STATUS} from "../../utils/consts/redux";
import {blockHasLocaleContent} from "../../utils/blocks/getBlockContent";

const MODES = {
  UI: "ui",
  CODE: "code"
};

/**
 * A Block is a visual element of any kind embedded in a Section. It can be a stat, generator,
 * selector, or anything listed in BLOCK_TYPES
 */
function Block({id, modified, callbacks, inline}) {

  const dispatch = useDispatch();
  const {setOpened, setModified, maybeCloseWithoutSaving, setInlineId} = callbacks;


  /* REDUX SELECTORS */

  /** Locale key that has been set as default */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);

  /** Block data object from database */
  const block = useBlock(id);

  // deep clone block state on mount
  useEffect(() => setBlockState(deepClone(block)), []);

  /* LOCAL STATE VARIABLES */

  /**
   * The content of the entire CMS is kept in a normalized redux object called reports.
   * These redux-level props cannot be edited directly, so each of the editors (draft, ace)
   * will clone their contents on mount, and report their new states here via callbacks.
   * When the user presses save, we have access to the current blockState here, so it can
   * be persisted to psql, pulled back into redux, and redistributed as props again.
   */
  const [blockState, setBlockState] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // block execution if there is no block state
  if (!block || !blockState) return null;

  /**
   * Variable that indicates where a block's "content" is stored
   *
   * Most blocks have translatable content, and store their locale-specific copies in a content table.
   * Generators and vizes are the exception - they store their one & only version directly in the psql block.
   */
  const blockHasNoLocaleContent = !blockHasLocaleContent(block.type);

  /** This blockState's content object */
  const blockContent = blockHasNoLocaleContent ? blockState?.content : blockState.contentByLocale[localeDefault]?.content;

  /**
   * Generic method for updating the content of the current block's working state.
   * Meant to be used by the various editors that a Block might have
   * @param {Object} content - partial object that will be used to patch the current content object
   * @param {string} locale - locale key that the edits pertain to (Optional)
   * @param {boolean} flagModified - flag that decides whether this change will signal that state has been modified (Default: true)
   * @param {boolean} isValidated - says whether given changes have been validated
   * @returns
   */
  const setBlockContent = (content = null, locale = localeDefault, flagModified = true, isValidated = undefined) => {
    // flag as modified if changes are made and user does not override
    if (flagModified && !modified) setModified(true);
    // only change validated status if boolean is given
    if (isValidated !== undefined && isValid !== isValidated) setIsValid(isValidated);
    // don't update state if no content given
    if (!content || Object.keys(content).length < 1) return;
    // if block's content is not locale-dependent, set blockState.content
    if (blockHasNoLocaleContent) {
      setBlockState({...blockState, content: {...blockState.content, ...content}});
    }
    // else, edit the correct contentByLocale object
    else {
      const existingContent = blockState.contentByLocale[locale] || {id, locale, content: {}};
      setBlockState({...blockState, contentByLocale: {...blockState.contentByLocale, [locale]: {...existingContent, content: {...existingContent.content, ...content}}}});
    }
  };

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
      else { /* todo1.0 toast error*/ }
      setLoading(false);
    });
  };

  const currentMode =
    blockState.type && blockContent[BLOCK_FIELDS.SIMPLE_ENABLED]
      ? MODES.UI
      : MODES.CODE;

  const onChangeMode = (mode, locale) => {
    const newMode = {[BLOCK_FIELDS.SIMPLE_ENABLED]: mode === MODES.UI};
    setBlockContent(newMode, locale, true);
  };

  const setBlockSettings = settings => {
    if (!modified) setModified(true);
    // Unlike other settings, type and shared are top-level, not stored in the settings object
    settings.type || settings.shared !== undefined
      ? setBlockState({...blockState, ...settings})
      : setBlockState({...blockState, settings: {...blockState.settings, ...settings}});
  };

  const executeButton = <Button style={{minHeight: 40}} disabled={!isValid} onClick={() => onSave(true)}>Save &amp; Execute</Button>;

  return (
    <React.Fragment>
      <BlockEditor
        blockContent={blockContent}
        blockType={block.type}
        currentMode={currentMode}
        executeButton={executeButton}
        id={id}
        key="be"
        locale={localeDefault}
        onSave={onSave}
        setBlockContent={setBlockContent}
        setBlockSettings={setBlockSettings}
        setInlineId={setInlineId}
      />
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
        <Button key="save" color="green" disabled={!isValid} onClick={() => onSave(false)}>Save &amp; Close</Button>
      </Group>
    </React.Fragment>
  );

}

export default Block;
