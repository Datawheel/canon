import React from "react";
export const AnchorLink = ({children, className, key, to}) => <a key={key} className={className} href={ `#${to}` }>{ children }</a>;
