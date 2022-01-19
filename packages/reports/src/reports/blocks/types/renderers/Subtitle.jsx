import React from "react";
import {Text} from "@mantine/core";

import sanitizeBlockContent from "../../../../utils/blocks/sanitizeBlockContent";

/**
 * "title" block renderer
*/
export default function SubtitlePreview({subtitle}) {

  const subtitleHTML = sanitizeBlockContent(subtitle) ||
    "<span class='cr-block-placeholder'>Small subtitle.</span>";

  return <Text size="sm" dangerouslySetInnerHTML={{__html: subtitleHTML}} />;
}
