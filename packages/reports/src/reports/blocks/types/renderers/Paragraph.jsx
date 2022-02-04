import React from "react";
import {Text} from "@mantine/core";

import sanitizeBlockContent from "../../../../utils/blocks/sanitizeBlockContent";

/**
 * "paragraph" block renderer
*/
export default function ParagraphPreview({paragraph, size = "md"}) {

  const paragraphHTML = sanitizeBlockContent(paragraph) ||
    "<span class='cr-block-placeholder'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam justo purus, placerat ac turpis at, dignissim interdum eros. Curabitur non tincidunt libero. Suspendisse quis nibh in massa tincidunt feugiat sit amet vitae nisl. In pulvinar sapien ut tincidunt volutpat. Donec auctor tellus eu augue feugiat, a viverra sapien pulvinar.</span>";

  return <Text size={size} dangerouslySetInnerHTML={{__html: paragraphHTML}} />;
}
