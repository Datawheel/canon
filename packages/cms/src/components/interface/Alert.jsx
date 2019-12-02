import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";
import {Icon} from "@blueprintjs/core";

import Portal from "./Portal";
import Parse from "../sections/components/Parse";

import "./Alert.css";

/** for now, this is just a wrapper around the blueprint Alert */
class Alert extends Component {
  render() {
    // const defaultConfig = {
    //   canOutsideClickCancel: true,
    //   canEscapeKeyCancel: true,
    //   intent: Intent.DANGER
    // };
    //
    // // merge the defaults & props
    // const config = {...defaultConfig, ...this.props};

    // TODO: replace blueprint alert with a custom, non-ugly one
    // return <BPAlert {...config} />;

    const {
      className,
      isModal,            // set to `true` to disable escape key/overlay click close
      isOpen,
      onCancel,
      onConfirm,
      children,           // main message
      description,        // when more context is needed
      autoFocusButton,    // set to "confirm" (default), "cancel", or null (if you must)
      confirmButtonText,
      cancelButtonText,
      theme,              // defaults to danger
      icon                // defaults to alert
    } = this.props;

    // don't render unless isOpen is true
    if (isOpen === false || isOpen === null || typeof isOpen === "undefined") return null;

    // also don't render unless we have onCancel and onConfirm
    else if (isOpen === true && (!onCancel || !onConfirm)) {
      console.log("missing `onCancel` or `onConfirm` prop in Alert.jsx");
      return null;
    }

    let Wrapper = Fragment;
    if (isModal) Wrapper = Portal;

    return (
      <Wrapper>
        {/* main alert content */}
        <div
          className={`cms-alert${className ? ` ${className}` : ""} ${isModal ? "is-modal" : "is-inline"}`}
          key="a"
        >
          <div className={`cms-alert-inner ${theme ? ` ${theme}-theme` : ""}`}>
            {icon &&
              <Icon className={`cms-alert-icon ${theme ? ` ${theme}-theme` : ""}`} icon={icon} />
            }

            {/* main alert text */}
            {children &&
              <Parse El="h2" className="cms-alert-heading u-font-xxl" key="h">
                {children}
              </Parse>
            }
            {/* optional context */}
            {description &&
              <Parse className="cms-alert-description u-font-lg u-margin-bottom-md" key="d">
                {description}
              </Parse>
            }
            <div className="cms-alert-actions u-font-sm">
              {/* cancel button */}
              <button
                className="cms-alert-actions-button"
                onClick={onCancel}
                autoFocus={autoFocusButton === "cancel"}
              >
                {cancelButtonText}
              </button>
              {/* confirm button */}
              <button
                className={`cms-alert-actions-button${theme ? ` ${theme}-theme` : ""}`}
                onClick={onConfirm}
                autoFocus={autoFocusButton === "confirm"}
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
  children: "Confirm action",
  confirmButtonText: "Confirm",
  cancelButtonText: "Cancel",
  icon: "warning-sign",
  theme: "danger",
  autoFocusButton: "confirm"
};

export default hot(Alert);
