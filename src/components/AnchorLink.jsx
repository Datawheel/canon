import React from "react";

const AnchorLink = ({children, to}) => <a href={ `#${to}` }>{ children }</a>;
export default AnchorLink;
export {AnchorLink};
