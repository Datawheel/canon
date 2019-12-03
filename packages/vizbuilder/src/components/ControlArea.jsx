import React from "react";

/**
 * @typedef OwnProps
 * @property {string} [className]
 * @property {string} title
 * @property {JSX.Element[]} [items]
 */

/** @type {React.FC<OwnProps>} */
const ControlArea = function({children, className, items, title}) {
  return (
    <div className={className}>
      <h4 className="label">{title}</h4>
      {items ? <div className="control-items">{items}</div> : null}
      {children}
    </div>
  );
};

export default ControlArea;
