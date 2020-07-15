import React from "react";

/**
 * @typedef OwnProps
 * @property {string} [className]
 * @property {string} href
 * @property {string} [target]
 * @property {string} [rel]
 */

/** @type {React.FC<OwnProps>} */
const ConditionalAnchor = function ConditionalAnchor(props) {
  const href = props.href;

  if (href) {
    return (
      <a className={props.className} href={href} target={props.target} rel={props.rel}>
        {props.children}
      </a>
    );
  }

  return <span className={props.className}>{props.children}</span>;
};

ConditionalAnchor.defaultProps = {
  target: "_blank",
  rel: "noopener noreferrer"
};

export default ConditionalAnchor;
