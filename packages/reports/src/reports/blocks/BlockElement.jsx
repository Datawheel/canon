/* react */
import React, {useState, useMemo} from "react";
import {useSelector} from "react-redux";
import {Modal, ActionIcon, Tooltip, useMantineTheme} from "@mantine/core";
import {HiOutlineCog, HiOutlineLogout, HiOutlineLogin, HiOutlinePencil, HiEyeOff} from "react-icons/hi";
import {AiOutlineGlobal} from "react-icons/ai";

/* components */
import CogMenu from "../components/CogMenu";
import BlockPreview from "./BlockPreview";
import Block from "./Block";

/* utils */
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";
import {useVariables} from "../hooks/blocks/useVariables";

/* enums */
import {ENTITY_TYPES} from "../../utils/consts/cms";

/* css */
import "./BlockElement.css";

/**
 * A Block is a visual element of any kind embedded in a Section. It can be a stat, generator,
 * selector, or anything listed in BLOCK_TYPES.
 * id - the id for this block
 */
function BlockElement({id, setHoverBlock, isInput, isConsumer, active}) {

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const block = useSelector(state => state.cms.reports.entities.blocks)?.[id];

  const {getConfirmation} = useConfirmationDialog();

  const [opened, setOpened] = useState(false);
  const [modified, setModified] = useState(false);
  const [inlineId, setInlineId] = useState(null);

  const {variables} = useVariables(id);

  const {allowed, allowedMessage} = useMemo(() => {
    const allowed = !block?._status?.hiddenByCascade;
    const allowedMessage = block?._status?.hiddenByCascade === id
      ? `Hidden by ${block?.settings?.allowed}: ${variables[block?.settings?.allowed]}`
      : `Hidden by ${block?._status?.hiddenByCascade}`;
    return {allowed, allowedMessage};
  }, [variables, block]);

  if (!block) return null;

  const theme = useMantineTheme();

  const maybeCloseWithoutSaving = async() => {
    if (modified) {
      const confirmed = await getConfirmation({
        title: "Close editor without saving?",
        confirmText: "Yes, abandon changes."
      });
      if (confirmed) {
        setOpened(false);
        setModified(false);
        setInlineId(null);
      }
    }
    else {
      setOpened(false);
      setModified(false);
      setInlineId(null);
    }
  };

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

  const callbacks = {
    setOpened,
    setModified,
    setInlineId,
    maybeCloseWithoutSaving
  };

  return (
    <React.Fragment>
      <div key="block" className="cr-section-block" {...hoverActions}
        style={{
          display: "flex",
          height: "100%",
          padding: theme.spacing.xs
        }}
      >
        { isInput || isConsumer ? <div className={`cr-block-link ${isInput ? "input" : "consumer"}`} key="link"
          style={{
            color: isInput ? theme.colors.red[5] : theme.colors.green[5]
          }}>
          { isInput ? <HiOutlineLogout size={20} /> : <HiOutlineLogin size={20} /> }
        </div> : null }
        <BlockPreview
          style={{color: "red"}}
          key="bp"
          id={id}
          active={active}
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
        {inlineId && <Block id={inlineId} inline={true} key={inlineId} modified={modified} callbacks={callbacks}/>}
        {!inlineId && <Block id={id} key={id} inline={false} modified={modified} callbacks={callbacks}/>}
      </Modal>
    </React.Fragment>
  );

}

export default BlockElement;
