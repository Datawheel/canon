/* react */
import React, {useMemo, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Select, Button, SegmentedControl, TextInput, Group, Checkbox} from "@mantine/core";

/* enums */
import {BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";

/* redux */
import {deleteEntity} from "../../actions/reports";

/* utils */
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";
import {useVariables} from "../hooks/blocks/useVariables";

/**
 *
 */
function BlockSettings({id, onChange}) {

  const dispatch = useDispatch();
  const {getConfirmation} = useConfirmationDialog();

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  /* state */
  const [width, setWidth] = useState(block.settings.width || "stretch");

  const types = useMemo(() => Object.values(BLOCK_TYPES)
    .map(d => ({value: d, label: upperCaseFirst(d)}))
  , [blocks]);

  const {variables} = useVariables(id);

  const allowed = useMemo(() => [{value: "always", label: "always"}].concat(Object.keys(variables).map(d => ({value: d, label: `${d}: ${variables[d]}`}))), [variables]);
  const shared = [{label: "Section-wide", value: "false"}, {label: "Report-wide", value: "true"}];
  const display = [{label: "inline", value: "inline"}, {label: "block", value: "block"}];
  const align = [{label: "left", value: "left"}, {label: "center", value: "center"}, {label: "right", value: "right"}];

  const maybeDelete = async() => {
    const confirmed = await getConfirmation({
      title: "Are you sure?",
      message: "Delete this block and all its contents? This action cannot be undone.",
      confirmText: "Yes, Delete it."
    });
    if (confirmed) {
      dispatch(deleteEntity(ENTITY_TYPES.BLOCK, {id}));
    }
  };

  const handleChange = (field, value) => {
    onChange({[field]: value});
  };

  const handleChangeWidth = (stretch, value) => {
    const result = stretch ? value ? "stretch" : "300" : value;
    setWidth(result);
    handleChange("width", result);
  };

  return (
    <Group>
      <Group direction="column">
        <Select label="Block Type" defaultValue={block.type} onChange={e => handleChange("type", e)} data={types} />
        <Select label="Allowed" defaultValue={block.settings.allowed || "always"} onChange={e => handleChange("allowed", e)} data={allowed} />
        <span>Sharing</span>
        <SegmentedControl defaultValue={String(block.shared)} onChange={e => handleChange("shared", e === "true")} data={shared}/>
        <span>[Coming soon - Viz Options]</span>
        <Button variant="outline" color="red" onClick={maybeDelete}>Delete Block</Button>
      </Group>
      <Group direction="column">
        <span>Layout Options</span>
        <Group>
          <TextInput label="width" error={width !== "stretch" && isNaN(width) ? "Width must be an integer" : ""} disabled={width === "stretch"} defaultValue={width} value={width} onChange={e => handleChangeWidth(false, e.target.value)} />
          <Checkbox label="stretch" checked={width === "stretch"} onChange={e => handleChangeWidth(true, e.target.checked)} />
        </Group>
        <span>Display</span>
        <SegmentedControl defaultValue={String(block.settings.display || "inline")} onChange={e => handleChange("display", e)} data={display}/>
        <span>Align</span>
        <SegmentedControl defaultValue={String(block.settings.align || "left")} onChange={e => handleChange("align", e)} data={align}/>
      </Group>
    </Group>
  );

}

export default BlockSettings;
