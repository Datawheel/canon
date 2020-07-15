/* eslint-disable func-style */
import {Classes, Icon, Text} from "@blueprintjs/core";
import classNames from "classnames";
import React from "react";

/** @type {React.FC<import("@blueprintjs/core").IMenuItemProps & {rightIcon?: import("@blueprintjs/core").IconName}>} */
export const MenuItem = function MenuItem({
  active,
  className = "",
  disabled = false,
  icon = false,
  intent = null,
  labelClassName = "",
  labelElement = null,
  multiline = false,
  shouldDismissPopover = true,
  rightIcon,
  tagName = "a",
  text,
  textClassName = "",
  ...htmlProps
}) {
  const intentClass = Classes.intentClass(intent);
  const anchorClasses = classNames(
    Classes.MENU_ITEM,
    intentClass,
    {
      [Classes.ACTIVE]: active,
      // eslint-disable-next-line eqeqeq
      [Classes.INTENT_PRIMARY]: active && intentClass == null,
      [Classes.DISABLED]: disabled,
      // prevent popover from closing when clicking on submenu trigger or disabled item
      [Classes.POPOVER_DISMISS]: shouldDismissPopover && !disabled
    },
    className
  );

  const label = labelElement
    ? <span className={labelClassName}>{labelElement}</span>
    : undefined;

  return React.createElement(
    tagName,
    {
      ...htmlProps,
      // eslint-disable-next-line no-extra-parens
      ...(disabled ? DISABLED_PROPS : {}),
      className: anchorClasses
    },
    icon ? <Icon icon={icon} /> : undefined,
    <Text className={classNames(Classes.FILL, textClassName)} ellipsize={!multiline}>
      {text}
    </Text>,
    label,
    rightIcon ? <Icon icon={rightIcon} /> : undefined
  );
};

// props to ignore when disabled
const DISABLED_PROPS = {
  href: undefined,
  onClick: undefined,
  onMouseDown: undefined,
  onMouseEnter: undefined,
  onMouseLeave: undefined,
  tabIndex: -1
};
