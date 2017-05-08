import React from "react";
export const AnchorLink = ({children, className, to}) => <a className={className} href={ `#${to}` }>{ children }</a>;
