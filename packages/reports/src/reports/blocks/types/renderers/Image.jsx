import React from "react";

import {Center, Badge} from "@mantine/core";

import sanitizeBlockContent from "../../../../utils/blocks/sanitizeBlockContent";

/**
 * "image" block renderer
*/
export default function ImagePreview(props) {

  const {alt = sanitizeBlockContent(alt), src, ...rest} = props;

  return src && alt
    ?  <img src={src} alt={alt} style={rest} />
    : <Center><Badge key="type" color="gray" variant="outline">IMAGE</Badge></Center>;
  
}
