import React, {Component, Fragment} from "react";
import ReactDOM from "react-dom";
import {hot} from "react-hot-loader/root";
import {Alert as BPAlert, Intent} from "@blueprintjs/core";

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
      confirmButtonTheme,
      cancelButtonText,
      cancelButtonTheme
    } = this.props;

    // don't render at all unless we have everything we need
    if (!isOpen || !onCancel || !onConfirm) {
      if (!onCancel || !onConfirm) console.log("missing `onCancel` or `onConfirm` prop in Alert.jsx");
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
          <div className="cms-alert-inner">
            {/* main alert text */}
            {children &&
              <Parse El="h2" className="cms-alert-heading" key="h">
                {children}
              </Parse>
            }
            {/* optional context */}
            {description &&
              <Parse El="h2" className="cms-alert-description" key="d">
                {description}
              </Parse>
            }
            <div className="cms-alert-actions">
              {/* cancel button */}
              <button
                className={`cms-alert-actions-button ${cancelButtonTheme}-theme`}
                onClick={onCancel}
                autoFocus={autoFocusButton === "cancel"}
              >
                {cancelButtonText}
              </button>
              {/* confirm button */}
              <button
                className={`cms-alert-actions-button ${confirmButtonTheme}-theme`}
                onClick={onCancel}
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
  confirmButtonTheme: "danger",
  cancelButtonText: "Cancel",
  cancelButtonTheme: "neutral",
  autoFocusButton: "confirm"
};

export default hot(Alert);
