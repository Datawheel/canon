/* react */
import React, {useMemo} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Select, Button, SegmentedControl} from "@mantine/core";

/* enums */
import {BLOCK_TYPES, ENTITY_TYPES} from "../../utils/consts/cms";

/* hooks */
import {useConfirmationDialog} from "../hooks/interactions/ConfirmationDialog";

/* redux */
import {deleteEntity} from "../../actions/reports";

/* utils */
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";

/**
 *
 */
function BlockSettings({id, onChange}) {

  const dispatch = useDispatch();
  const {getConfirmation} = useConfirmationDialog();

  /* redux */
  const blocks = useSelector(state => state.cms.reports.entities.blocks);
  const block = blocks[id];

  const types = useMemo(() => Object.values(BLOCK_TYPES)
    .map(d => ({value: d, label: upperCaseFirst(d)}))
  , [blocks]);

  const allowed = useMemo(() => {
    const variables = Object.values(blocks)
      .filter(d => block.inputs.includes(d.id))
      .reduce((acc, d) => ({...acc, ...d._variables}), {});
    return [{value: "always", label: "always"}].concat(Object.keys(variables).map(d => ({value: d, label: `${d}: ${variables[d]}`})));
  }, [blocks, block]);

  const shared = [{label: "Section-wide", value: "false"}, {label: "Report-wide", value: "true"}];

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

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <Select label="Block Type" defaultValue={block.type} onChange={e => handleChange("type", e)} data={types} />
      <Select label="Allowed" defaultValue={block.settings.allowed || "always"} onChange={e => handleChange("allowed", e)} data={allowed} />
      Sharing
      <SegmentedControl defaultValue={String(block.shared)} onChange={e => handleChange("shared", e === "true")} data={shared}/>
      [Coming soon - Viz Options]
      <Button variant="outline" color="red" onClick={maybeDelete}>Delete Block</Button>
    </div>
  );

}

export default BlockSettings;
