import React from "react";
import {Group} from "@mantine/core";

import Stat from "../sections/components/Stat";

/** */
export default function Graphic({config}) {
  return (
    <Group className="cp-graphic">
      {config.imageURL &&
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.imageURL} className="cp-graphic-img" alt="" />
      }
      {
        config.value &&
        <Stat
          className="cp-graphic-stat"
          label={config.label}
          value={config.value}
          subtitle={config.subtitle}
        />
      }
    </Group>
  );
}
