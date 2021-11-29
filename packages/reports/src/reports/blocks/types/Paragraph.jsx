import React from "react";
import {Text} from "@mantine/core";

/**
 * "title" block renderer
*/
export default function ParagraphPreview({paragraph}) {
  return <Text size="md" dangerouslySetInnerHTML={{__html: paragraph}} />;
}
