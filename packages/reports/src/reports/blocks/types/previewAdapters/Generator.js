import {format} from "pretty-format";
const LENGTH_CUTOFF_CHAR = 10000;

/** @type {import(".").BlockPreviewAdapterFunction} */
const generatorPreviewAdapter = ({block, active}) => {
  const payload = {};
  if (!active) return {content: {}, log: "", error: false, duration: false};
  payload.content = {outputVariables: block._variables};
  payload.log = block._status && block._status.log ? block._status.log.map(d => format(d)).join("\n") : false;
  payload.error = block._status && block._status.error ? block._status.error : block._variables.length > LENGTH_CUTOFF_CHAR ? `Warning - Large Output (${block._variables.length} chars)` : false;
  payload.duration = block._status && block._status.duration ? block._status.duration : false;

  return payload;
};

export default generatorPreviewAdapter;
