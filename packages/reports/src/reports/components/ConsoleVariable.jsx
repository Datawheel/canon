import React from "react";
import {Accordion, Group, Text, useMantineTheme} from "@mantine/core";
import {Prism} from "@mantine/prism";
import "./ConsoleVariable.css";

const evalType = value => {
  let t = typeof value;
  if (t === "object") {
    if (value === null) return "undefined";
    else if (["Array"].includes(value.constructor.name)) t = "array";
    else if (["Error", "EvalError", "ReferenceError", "SyntaxError"].includes(value.constructor.name)) t = "error";
  }
  return t;
};

const sortOrder = ["object", "array", "string", "number"];

/**
 * Displays a variable output by a block.
 * @param {*} value
 */
function ConsoleVariable({dimmed, label, root = true, value}) {

  const t = evalType(value);
  let v = value;

  if (t === "object") {
    return <Accordion iconSize={12} className="cr-variable-accordion">
      <Accordion.Item label={<Text lineClamp={1} size="xs" weight={700}>{label}</Text>}>
        { Object.keys(value)
          .sort((a, b) => {
            const aType = evalType(value[a]);
            const bType = evalType(value[b]);
            if (aType !== bType) return sortOrder.indexOf(aType) - sortOrder.indexOf(bType);
            return a.localeCompare(b);
          })
          .map(k => <ConsoleVariable root={false} key={k} label={k} value={value[k]} />) }
      </Accordion.Item>
    </Accordion>;
  }
  else if (t === "array") {
    return <Accordion iconSize={12} className="cr-variable-accordion">
      <Accordion.Item label={<Text lineClamp={1} size="xs" weight={700}>{label}</Text>}>
        { value.map((k, i) => <ConsoleVariable root={false} key={i} label={i} value={k} />) }
      </Accordion.Item>
    </Accordion>;
  }

  if (t === "string") v = `"${v}"`;
  else if (t === "error") v = `Error: ${v.message}`;
  else if (t === "undefined") v = t;
  else if (v.toString) v = v.toString();

  const theme = useMantineTheme();

  return <Group noWrap={true}>
    <Text
      color={dimmed ? "dimmed" : theme.primaryColor}
      lineClamp={1}
      size="xs"
      style={{
        overflow: "visible",
        wordBreak: "keep-all",
        whiteSpace: "nowrap"
      }}
      weight={700}
    >
      { root ? `{{${label}}}` : label }
    </Text>
    <Prism
      className="cr-variable"
      language="js"
      noCopy
      style={{
        flex: "1 1 100%",
        overflowY: "scroll",
        padding: 0,
        textAlign: "right"
      }}
    >
      {v}
    </Prism>
  </Group>;

}

export default ConsoleVariable;
