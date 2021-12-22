/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Col, Grid, useMantineTheme} from "@mantine/core";

/* consts */
import {BLOCK_TYPES} from "../../utils/consts/cms";

/* css */
import "./BlockOutputPanel.css";

/**
 *
 */
function BlockOutputPanel({id, components, mode}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const blocks = useSelector(state => state.cms.reports.entities.blocks);

  const block = blocks[id];

  const {apiInput, codeEditor, simpleUI, executeButton, blockPreview, textEditor} = components;

  const isStatlike = ![BLOCK_TYPES.GENERATOR, BLOCK_TYPES.VIZ, BLOCK_TYPES.SELECTOR].includes(block.type);

  const theme = useMantineTheme();

  return (
    <Grid className="cr-block-output" style={{flex: 1, marginTop: theme.spacing.md, width: "100%"}}>
      <Col span={7} className={`cr-block-output-editor ${mode}`}>
        {mode === "code"
          ? <React.Fragment>
            {apiInput}
            {codeEditor}
            {executeButton}
          </React.Fragment>
          : isStatlike
            ? textEditor
            : simpleUI
        }
      </Col>
      <Col span={5} style={{display: "flex", flexDirection: "column"}}>
        {blockPreview}
      </Col>
    </Grid>
  );

}

export default BlockOutputPanel;
