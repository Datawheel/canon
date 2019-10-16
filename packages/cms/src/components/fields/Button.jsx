import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./Button.css";

export default class Button extends Component {
  render() {
    const {
      active,       // button is currently pressed; useful for button groups
      fill,         // set `true` to completely fill container width
      children,
      className,
      fontSize,
      namespace,    // "cp" (default) or "cms"
      disabled,
      rebuilding,   // add a spinning animation
      type,         // pretty much just for "submit"
      ref,
      icon,         // blueprint icon name (https://blueprintjs.com/docs/#icons)
      iconOnly,     // set `true` to hide the text (NOTE: `children` is still required for accessibility)
      iconPosition, // "left" || "right" (default)
      onClick
    } = this.props;

    return (
      <button
        className={`${namespace}-button u-font-${fontSize}${
          className ? ` ${className}` : ""
        }${
          active ? " is-active" : " is-inactive"
        }${
          rebuilding ? " is-rebuilding" : ""
        }${
          iconOnly && children !== "Missing `children` prop in Button.jsx" ? " cms-icon-only-button" : ""
        }${
          fill ? ` ${namespace}-fill-button` : ""
        }`}
        disabled={disabled}
        tabIndex={disabled ? "-1" : null}
        onClick={onClick && !disabled ? onClick : null}
        type={type}
        ref={ref}
      >
        {/* left icon (default) */}
        {icon && iconPosition === "left" &&
          <Icon className={`${namespace}-button-icon`} icon={icon} />
        }

        {/* button text */}
        <span className={`${namespace}-button-text${
          icon && iconOnly && children !== "Missing `children` prop in Button.jsx" ? " u-visually-hidden" : ""}`
        }>
          {children}
        </span>

        {/* right icon */}
        {icon && iconPosition === "right" &&
          <Icon className={`${namespace}-button-icon`} icon={icon} htmlTitle="" />
        }
      </button>
    );
  }
}

Button.defaultProps = {
  iconOnly: false,
  iconPosition: "right",
  children: "Missing `children` prop in Button.jsx",
  fontSize: "sm",
  namespace: "cp"
};
