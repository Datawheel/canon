/* react */
import React, {useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {Col, Divider, Grid, Tabs} from "@mantine/core";
import {HiOutlineEye, HiOutlineCog} from "react-icons/hi";

/* consts */
import {BLOCK_TYPES} from "../../utils/consts/cms";

/* components */
import ApiInput from "../components/ApiInput";
import AceWrapper from "../editors/AceWrapper";
import BlockOutputPanel from "./BlockOutputPanel";
import BlockPreview from "./BlockPreview";
import BlockSettings from "./BlockSettings";
import InputMenu from "../components/InputMenu";
import InputMenuItem from "../components/InputMenuItem";
import SimpleUI from "../editors/SimpleUI";
import VariableList from "./VariableList";

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
    id={id}
    blockType={blockType}
    locale={locale}
    simpleState={simpleState}
    setBlockContent={setBlockContent}
    executeButton={executeButton}
  />;

  const components = {blockPreview, codeEditor, executeButton, uiEditor};

  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];
  const response = useMemo(() => block._status && block._status.response ? block._status.response : false, [blocks]);

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
            blockStateContent={blockContent}
            defaultValue={blockContent?.api}
            id={id}
            locale={locale}
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
            <BlockOutputPanel
              id={id}
              components={components}
              mode={currentMode}
            />
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
