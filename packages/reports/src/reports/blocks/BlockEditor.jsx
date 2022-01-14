/* react */
import React, {useState} from "react";
import {Button, Center, Col, Grid, SegmentedControl, useMantineTheme} from "@mantine/core";
import {HiOutlineEye, HiOutlineCog} from "react-icons/hi";

/* components */
import ApiInput from "../components/ApiInput";
import AceWrapper from "../editors/AceWrapper";
import BlockOutputPanel from "./BlockOutputPanel";
import BlockPreview from "./BlockPreview";
import BlockSettings from "./BlockSettings";
import InputMenu from "../components/InputMenu";
import SimpleUI from "../editors/SimpleUI";
import VariableList from "./VariableList";

/**
 *
 * @param {*} param0
 * @returns
 */
function BlockEditor({
  blockContent, blockType, currentMode, id, locale,
  onSave, setBlockContent, setBlockSettings, setInlineId
}) {

  /* HOOKS */
  const [tab, setTab] = useState("output");
  const theme = useMantineTheme();

  /* CHANGE HANDLERS */

  const onChangeCode = (logic, locale) => setBlockContent({logic}, locale);
  const onChangeAPI = api => setBlockContent({api});

  /**
   * Gen/Viz/Selector editors should not re-render on every single change, as their javascript is often broken mid-keystroke.
   * Therefore, render these blocks using the static props version, which only updates on Save. Normal stat-likes
   * can update on keystroke, so the user can watch the prose change as they type.
   */
  // const usePropBlock = [BLOCK_TYPES.GENERATOR, BLOCK_TYPES.VIZ, BLOCK_TYPES.SELECTOR].includes(blockType);


  const blockPreview = <BlockPreview
    id={id}
    key="block-preview"
    active={true}
    blockStateContent={blockContent}
    locale={locale}
    allowed={true}
    debug={true}
  />;

  const apiInput = <ApiInput
    key="api-input"
    defaultValue={blockContent?.api}
    id={id}
    onChange={onChangeAPI}
    onEnterPress={() => onSave(true)}
  />;

  /** Editor for modifying a block's JS logic directly */
  // The codeEditor is the only editor that changes *based on another editor, i.e, the simpleUI.
  // Therefore it must be controlled, and its state must live here in Block.jsx
  const codeEditor = <AceWrapper
    style={{flex: 1}}
    key="code-editor"
    onChange={logic => onChangeCode(logic, locale)}
    value={blockContent?.logic || ""}
  />;

  const executeButton = <Button style={{minHeight: 40}} onClick={() => onSave(true)}>Save &amp; Execute</Button>;

  const simpleState = blockContent?.simple || {};

  const uiEditor = <SimpleUI
    blockType={blockType}
    locale={locale}
    simpleState={simpleState}
    setBlockContent={setBlockContent}
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
