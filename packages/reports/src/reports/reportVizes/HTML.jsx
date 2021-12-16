import React from "react";

/** */
export default function HTML({config}) {

  if (!config || !config.html) return null;

  return <div className="cp-viz cp-html" dangerouslySetInnerHTML={{__html: config.html}} />;
}
