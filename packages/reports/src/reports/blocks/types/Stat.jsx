import React from "react";
import {Text} from "@mantine/core";

import sanitizeBlockContent from "../../../utils/blocks/sanitizeBlockContent";

/**
 * "stat" block renderer
*/
export default function StatPreview({subtitle, title, value}) {

  let titleHTML = sanitizeBlockContent(title);
  let valueHTML = sanitizeBlockContent(value);
  let subtitleHTML = sanitizeBlockContent(subtitle);

  if (!titleHTML && !valueHTML && !subtitleHTML) {
    titleHTML = "<span class='cr-block-placeholder'>Title</span>";
    valueHTML = "<span class='cr-block-placeholder'>Big Stat</span>";
    subtitleHTML = "<span class='cr-block-placeholder'>Subtitle</span>";
  }

  return (
    <div>
      <Text size="md" dangerouslySetInnerHTML={{__html: titleHTML}} />
      <Text size="xl" dangerouslySetInnerHTML={{__html: valueHTML}} />
      <Text size="sm" dangerouslySetInnerHTML={{__html: subtitleHTML}} />
    </div>
  );
}
