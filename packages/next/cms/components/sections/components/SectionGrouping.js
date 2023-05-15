import React from "react";
import {Group} from "@mantine/core";
import toKebabCase from "../../../utils/formatters/toKebabCase";

/**
 *
 * @param {*} param0
 * @returns
 */
export default function SectionGrouping({children, layout}) {
  const layoutClass = `cp-${toKebabCase(layout)}-section-grouping`;

  return (
    <div className={`cp-section-grouping ${layoutClass}`}>
      <Group
        className={`cp-section-grouping-inner ${layoutClass}-inner`}
      >
        {children}
      </Group>
    </div>
  );
}
