/* react */
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {Center, Col, Grid, SegmentedControl, useMantineTheme} from "@mantine/core";
import {HiOutlineEye, HiOutlineCog} from "react-icons/hi";

/* components */
import ApiInput from "../components/ApiInput";
import AceWrapper from "../editors/AceWrapper";
import BlockOutputPanel from "./BlockOutputPanel";
import BlockPreview from "./BlockPreview";
import BlockSettings from "./BlockSettings";
import InputMenu from "../components/InputMenu";
import SimpleUI from "../editors/SimpleUI";
import RichTextEditor from "../editors/RichTextEditor";
import VariableList from "./VariableList";

/**
 *
 */
function BlockEditor({id, locale, setBlockContent, setBlockSettings}) {

  /* CHANGE HANDLERS */

  const onChangeText = (content, locale) => setBlockContent(content, locale);
  const onTextModify = () => setBlockContent(); // set modified to be true  but don't update state
  const onChangeCode = (logic, locale) => setBlockContent({logic}, locale);
  const onChangeSimple = (simple, logic, locale) => setBlockContent({simple, logic}, locale);
  const onChangeAPI = api => setBlockContent({api});

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
    locale={locale}
    variables={variables}
    allowed={true}
    debug={true}
  />;

  const simpleState = hasNoLocaleContent(blockState.type)
    ? blockState.content?.simple
    : blockState.contentByLocale?.[locale]?.content?.simple;

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
    onChange={logic => onChangeCode(logic, locale)}
    value={blockState.type
      ? hasNoLocaleContent(blockState.type)
        ? blockState.content.logic
        : blockState.contentByLocale[locale].content.logic
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
      locale={locale}
      key="text-editor"
      defaultContent={block.contentByLocale[locale].content.simple || {}}
      fields={BLOCK_MAP[block.type]}
      formatters={formatters}
      variables={variables}
      onChange={onChangeText}
      onTextModify={onTextModify}
    />
    : <SimpleUI
      type={block.type}
      locale={locale}
      simpleState={simpleState}
      onChange={onChangeSimple}
      executeButton={executeButton}
    />;

  const components = {blockPreview, apiInput, codeEditor, blockSettings, executeButton, uiEditor};

  const blockSettings = <BlockSettings
    id={id}
    onChange={setBlockSettings}
  />;

  const blockOutputPanel = <BlockOutputPanel
    id={id}
    components={components}
    mode={currentMode}
  />;

  const variableList = <VariableList id={id} setInlineId={setInlineId}/>;

  const panels = {blockSettings, blockOutputPanel, variableList};

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  const [tab, setTab] = useState("output");
  const theme = useMantineTheme();

  if (!block) return null;

  return (
    <Grid style={{height: "60vh"}}>
      <Col span={3} style={{display: "flex", flexDirection: "column"}}>
        <InputMenu id={id}/>
        {panels.variableList}
      </Col>
      <Col span={9}
        style={{
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Center>
          <SegmentedControl
            value={tab}
            onChange={setTab}
            data={[
              {
                label: <Center>
                  <HiOutlineEye />
                  <div style={{marginLeft: theme.spacing.sm}}>Content</div>
                </Center>,
                value: "output"
              },
              {
                label: <Center>
                  <HiOutlineCog />
                  <div style={{marginLeft: theme.spacing.sm}}>Settings</div>
                </Center>,
                value: "settings"
              }
            ]}
          />
        </Center>
        {{
          output: panels.blockOutputPanel,
          settings: panels.blockSettings
        }[tab]}
      </Col>
    </Grid>
  );

}

export default BlockEditor;
