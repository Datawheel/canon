import React from "react";
import {Title} from "@mantine/core";

/**
 * "title" block renderer
*/
export default function TitlePreview({title, size = 4}) {
  return <Title order={size} dangerouslySetInnerHTML={{__html: title}} />;
}
