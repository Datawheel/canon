import {Button, Tooltip} from "@blueprintjs/core";
import React from "react";

/**
 * @typedef OwnProps
 * @property {string} [className]
 * @property {string} title
 * @property {import("@blueprintjs/core").IconName} [icon]
 * @property {import("@blueprintjs/core").PopoverPosition} [position]
 * @property {(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void} [onClick]
 */

/** @type {React.FC<OwnProps>} */
const ButtonTooltip = function ButtonTooltip({
  className,
  icon,
  onClick,
  position,
  title
}) {
  return (
    <Tooltip className={className} content={title} position={position}>
      <Button onClick={onClick} icon={icon} />
    </Tooltip>
  );
};

ButtonTooltip.defaultProps = {
  position: "auto"
};

export default ButtonTooltip;
