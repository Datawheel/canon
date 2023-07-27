import React from "react";
import {
  Text, Stack,
} from "@mantine/core";
import stripP from "../../../utils/formatters/stripP";

/**
 *
 * @param {*} param0
 * @returns
 */
function Stat({
  label, value, subtitle, ...rest
}) {
  return (
    <Stack className="cp-stat" align="flex-start" maw={250} spacing={0} my="md" {...rest}>
      {label
        && <Text className="cp-stat-label" dangerouslySetInnerHTML={{__html: stripP(label)}} span />}
      <Text className="cp-stat-value" size="xl" dangerouslySetInnerHTML={{__html: stripP(value)}} span />
      {subtitle && subtitle !== "<p>New Subtitle</p>"
        && (
        <Text
          className="cp-stat-subtitle"
          dangerouslySetInnerHTML={{__html: stripP(subtitle)}}
          tt="uppercase"
          span
        />
        )}
    </Stack>
  );
}

export default Stat;
