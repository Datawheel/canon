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
    <fieldset className={className}>
      <legend className="label">{title}</legend>
      {items ? <div className="control-items">{items}</div> : null}
      {children}
    </fieldset>
  );
};

export default ControlArea;
