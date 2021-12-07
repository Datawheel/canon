import React from "react";
import {Title} from "@mantine/core";

import sanitizeBlockContent from "../../../utils/sanitizeBlockContent";

/**
 * "title" block renderer
*/
export default function TitlePreview({title, size = 4}) {

  const titleHTML = sanitizeBlockContent(title) ||
    `<span class='cr-block-placeholder'>${["Large", "Medium", "Small"][size - 2]} Title</span>`;

  return <Title order={size} dangerouslySetInnerHTML={{__html: titleHTML}} />;
}
