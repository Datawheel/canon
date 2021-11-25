import React from "react";
import {Skeleton, Text} from "@mantine/core";


/**
 * "stat" block renderer
*/
export default function StatPreview({subtitle, title, value}) {
  return (
    <div>
      <Text size="md" dangerouslySetInnerHTML={{__html: title}} />
      <Text size="xl" dangerouslySetInnerHTML={{__html: value}} />
      <Text size="sm" dangerouslySetInnerHTML={{__html: subtitle}} />
    </div>
  );
}
