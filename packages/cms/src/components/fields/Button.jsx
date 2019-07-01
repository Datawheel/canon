import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import "./Button.css";

export default class Button extends Component {
  render() {
    const {
      active,       // button is currently pressed; useful for button groups
      block,        // set `true` to completely fill container width
      children,
      className,
      disabled,
      rebuilding,   // add a spinning animation
      icon,         // blueprint icon name (https://blueprintjs.com/docs/#icons)
      iconOnly,     // set `true` to hide the text (NOTE: `children` is still required for accessibility)
      iconPosition, // "left" || "right" (default)
      onClick
    } = this.props;

    return (
      <button
        className={`cms-button${
          className ? ` ${className}` : ""
        }${
          active ? " is-active" : " is-inactive"
        }${
          rebuilding ? " is-rebuilding" : ""
        }${
          iconOnly && children !== "Missing `children` prop in Button.jsx" ? " cms-icon-only-button" : ""
        }${
          block ? " is-block" : ""
        }`}
        disabled={disabled}
        tabIndex={disabled ? "-1" : null}
        onClick={onClick && !disabled ? onClick : null}
      >
        {/* left icon (default) */}
        {icon && iconPosition === "left" &&
          <Icon className="cms-button-icon" icon={icon} />
        }

        {/* button text */}
        <span className={`cms-button-text${
          icon && iconOnly && children !== "Missing `children` prop in Button.jsx" ? " u-visually-hidden" : ""}`
        }>
          {children}
        </span>

        {/* right icon */}
        {icon && iconPosition === "right" &&
          <Icon className="cms-button-icon" icon={icon} />
        }
      </button>
    );
  }
}

Button.defaultProps = {
  iconOnly: false,
  iconPosition: "right",
  children: "Missing `children` prop in Button.jsx"
};
