import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";
import {Icon} from "@blueprintjs/core";

import Portal from "./Portal";
import Parse from "../sections/components/Parse";

import "./Alert.css";

class Alert extends Component {
  constructor(props) {
    super(props);
    this.cancelButton = React.createRef();
    this.confirmButton = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const {autoFocusButton, isOpen} = this.props;
    // when opening the alert, focus either the confirm (default) or cancel button
    if (!prevProps.isOpen && isOpen && (autoFocusButton === "confirm" || autoFocusButton === "cancel")) {
      // after .is-animating is removed from portal
      setTimeout(() => this[`${autoFocusButton}Button`].current.focus(), 200);
    }
  }

  render() {
    const {
      className,
      usePortal,          // good luck
      isOpen,
      isModal,            // set to `true` to disable escape key/overlay click close
      portalProps,        // spread into Portal component
      onCancel,
      onConfirm,
      title,              // main message
      description,        // when more context is needed
      confirmButtonText,
      cancelButtonText,
      controls,           // for when a title, description, and two buttons aren't enough
      theme,              // defaults to danger
      icon                // defaults to warning-sign
    } = this.props;

    // don't render unless isOpen is true
    if (isOpen === false || isOpen === null || typeof isOpen === "undefined") return null;

    // also don't render unless we have onCancel and onConfirm
    else if (isOpen === true && (!onCancel || !onConfirm)) {
      console.log("missing `onCancel` or `onConfirm` prop in Alert.jsx");
      return null;
    }

    let Wrapper = Fragment;
    if (usePortal) Wrapper = Portal;

    return (
      <Wrapper {...portalProps}>
        {/* main alert content */}
        <div
          className={`cms-alert${className ? ` ${className}` : ""} ${isModal ? "is-modal" : "is-inline"}`}
          key="a"
        >
          <div className={`cms-alert-inner${theme ? ` ${theme}-theme` : ""}`}>
            {icon &&
              <Icon className="cms-alert-icon" icon={icon} />
            }

            {/* main alert text */}
            {title &&
              <h2 className="cms-alert-heading u-font-xxl" key="h">
                {title}
              </h2>
            }
            {/* optional context */}
            {description &&
              <p className="cms-alert-description u-font-lg u-margin-bottom-md" key="d">
                {description}
              </p>
            }
            {/* additional functionality */}
            {controls}

            <div className="cms-alert-actions u-font-sm">
              {/* cancel button */}
              <button
                className="cms-alert-actions-button"
                onClick={onCancel}
                ref={this.cancelButton}
                key="cancel"
              >
                {cancelButtonText}
              </button>
              {/* confirm button */}
              <button
                className={`cms-alert-actions-button${theme ? ` ${theme}-theme` : ""}`}
                onClick={onConfirm}
                ref={this.confirmButton}
                key="confirm"
              >
                {confirmButtonText}
              </button>
            </div>
          </div>

          {/* overlay */}
          {isModal &&
            <button
              className="cms-alert-overlay cms-overlay"
              onClick={onCancel}
              onFocus={onCancel}
              key="o"
            >
              <span className="u-visually-hidden">Close modal</span>
            </button>
          }
        </div>
      </Wrapper>
    );
  }
}

Alert.defaultProps = {
  isModal: true,
  title: "Confirm action",
  confirmButtonText: "Confirm",
  cancelButtonText: "Cancel",
  icon: "warning-sign",
  theme: "danger",
  autoFocusButton: "confirm"    // also accepts "cancel", or null/false (if you must)
};

export default hot(Alert);
