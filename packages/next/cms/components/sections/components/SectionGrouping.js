import React from "react";
import {Group, useMantineTheme} from "@mantine/core";
import toKebabCase from "../../../utils/formatters/toKebabCase";
import {useMediaQuery} from "@mantine/hooks";

/**
 *
 * @param {*} param0
 * @returns
 */
export default function SectionGrouping({children, layout}) {
  const layoutClass = `cp-${toKebabCase(layout)}-section-grouping`;
  const theme = useMantineTheme();
  const smallerThanMd = useMediaQuery(`${theme.breakpoints.md}px`);
  return (
    <div className={`cp-section-grouping ${layoutClass}`}>
      <Group
        className={`cp-section-grouping-inner ${layoutClass}-inner`}
        spacing="xl"
        noWrap={!smallerThanMd}
        grow
      >
        {children}
      </Group>
    </div>
  );
}
