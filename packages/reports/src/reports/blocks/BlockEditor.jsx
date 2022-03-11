/* react */
import React, {useRef, useState} from "react";
import {Col, Divider, Grid, Tabs} from "@mantine/core";
import {HiOutlineEye, HiOutlineCog} from "react-icons/hi";

/* consts */
import {BLOCK_TYPES} from "../../utils/consts/cms";

/* hooks */
import {useBlock} from "../hooks/blocks/selectors";

/* components */
import ApiInput from "../components/ApiInput";
import AceWrapper from "../editors/AceWrapper";
import BlockPreview from "./BlockPreview";
import BlockSettings from "./BlockSettings";
import InputMenu from "../components/InputMenu";
import InputMenuItem from "../components/InputMenuItem";
import SimpleUI from "../editors/SimpleUI";
import VariableList from "./VariableList";

/* css */
import "./BlockEditor.css";

/**
 *
 * @param {*} param0
 * @returns
 */
function BlockEditor({
  blockContent, blockType, currentMode, executeButton, id, locale,
  onSave, setBlockContent, setBlockSettings, setInlineId
}) {

  /* HOOKS */
  const [tab, setTab] = useState(0);
  const block = useBlock(id);
  const response = block._status && block._status.response ? block._status.response : false;

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

  /** Editor for modifying a block's JS logic directly */
  // The codeEditor is the only editor that changes *based on another editor, i.e, the simpleUI.
  // Therefore it must be controlled, and its state must live here in Block.jsx
  const codeEditor = <AceWrapper
    style={{flex: 1}}
    key="code-editor"
    onChange={logic => onChangeCode(logic, locale)}
    value={blockContent?.logic || ""}
  />;

  const simpleState = blockContent?.simple || {};

  const uiEditor = <SimpleUI
    blockType={blockType}
    id={id}
    locale={locale}
    simpleState={simpleState}
    setBlockContent={setBlockContent}
    executeButton={executeButton}
  />;

  return (
    <Grid style={{height: "60vh"}}>
      <Col span={3}
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        <InputMenu id={id}/>
        <VariableList id={id} setInlineId={setInlineId}/>
        { blockType === BLOCK_TYPES.GENERATOR && <div>
          <Divider label="API Data (resp)" labelPosition="center" />
          <ApiInput
            defaultValue={blockContent?.api}
            id={id}
            onChange={onChangeAPI}
            onEnterPress={() => onSave(true)}
          />
          { response && <div
            style={{
              maxHeight: 200,
              overflowY: "scroll"
            }}
          >
            <InputMenuItem variables={response} />
          </div> }
        </div>}
      </Col>
      <Col span={9}
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        <Tabs
          active={tab}
          onTabChange={setTab}
          position="center"
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            width: "100%"
          }}
          styles={{
            body: {
              display: "flex",
              flex: "1 1 100%"
            }
          }}
          variant="pills"
        >
          <Tabs.Tab label="Content" icon={<HiOutlineEye />}>
            {/** Block Editor */}
            <Grid className="cr-block-output" style={{flex: 1, width: "100%"}}>
              <Col key="content-col" span={8} className={`cr-block-output-editor ${currentMode}`}>
                {/*
                  * todo1.0 - the button for changing modes is in parent component, but it needs to be disabled if a SimpleUI does not exist.
                  * This is only a problem if there exists types of Blocks with no simple UI mode of editing
                  */}
                {currentMode === "code" && 
                  <>
                    {codeEditor}
                    {executeButton}
                  </>
                }
                {currentMode !== "code" && uiEditor}
              </Col>
              {/** Block Preview */}
              <Col span={4} style={{display: "flex", flexDirection: "column"}}>
                {blockPreview}
              </Col>
            </Grid>
          </Tabs.Tab>
          <Tabs.Tab label="Settings" icon={<HiOutlineCog />}>
            <BlockSettings
              id={id}
              setBlockSettings={setBlockSettings}
              setBlockContent={setBlockContent}
            />
          </Tabs.Tab>
        </Tabs>
      </Col>
    </Grid>
  );

}

export default BlockEditor;
