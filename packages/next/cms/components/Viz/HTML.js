import React from "react";
export default function HTML({config}) {
  return <div className="cp-viz cp-html" dangerouslySetInnerHTML={{__html: config.html}}></div>;
}
