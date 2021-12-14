import React, {useMemo} from "react";
import {Text, Textarea} from "@mantine/core";
import {format} from "pretty-format";

/**
 *
 */
function Generator({blockState, active, variables, locale, allowed}) {

  const LENGTH_CUTOFF_CHAR = 10000;

  const {outputVariables, log, error, duration} = useMemo(() => {
    if (!active) return {outputVariables: {}, log: "", error: false, duration: false};
    const outputVariables = format(blockState._variables);
    const log = blockState._status.log ? blockState._status.log.map(d => format(d)).join("\n") : false;
    const error = blockState._status.error ? blockState._status.error : outputVariables.length > LENGTH_CUTOFF_CHAR ? `Warning - Large Output (${outputVariables.length} chars)` : false;
    const duration = blockState._status.duration ? blockState._status.duration : false;
    return {outputVariables, log, error, duration};
  }, [blockState, active]);

  return (
    <div>
      {duration && <Text>{`duration: ${duration} ms`}</Text>}
      <Textarea
        label="Output"
        error={error}
        value={outputVariables}
        style={{width: 300}}
        styles={{input: {fontFamily: "monospace"}}}
        size="xs"
        autosize
        minRows={10}
      />
      {log && <Textarea label="Console" minRows={3} value={log} error="Warning - Remove console.log after debugging"/>}
    </div>
  );

}

export default Generator;
