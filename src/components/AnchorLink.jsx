import React from "react";
export const AnchorLink = ({children, to}) => <a href={ `#${to}` }>{ children }</a>;
