import React from "react";
import {Text} from "@mantine/core";

/* utils */
import sanitizeBlockContent from "../../../utils/sanitizeBlockContent";

/**
 * "title" block renderer
*/
export default function ParagraphPreview({paragraph}) {
  return <Text size="md" dangerouslySetInnerHTML={{__html: sanitizeBlockContent(paragraph)}} />;
}
