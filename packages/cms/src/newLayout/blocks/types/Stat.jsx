import React from "react";
import {Text} from "@mantine/core";

/* utils */
import sanitizeBlockContent from "../../../utils/sanitizeBlockContent";

/**
 * "title" block renderer
*/
export default function StatPreview({subtitle, title, value}) {
  return (
    <div>
      <Text size="md" dangerouslySetInnerHTML={{__html: sanitizeBlockContent(title)}} />
      <Text size="xl" dangerouslySetInnerHTML={{__html: sanitizeBlockContent(value)}} />
      <Text size="sm" dangerouslySetInnerHTML={{__html: sanitizeBlockContent(subtitle)}} />
    </div>
  );
}
