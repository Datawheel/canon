import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

import Portal from "./Portal";
import Button from "../fields/Button";
import Parse from "../sections/components/Parse";
import DialogFooter from "../editors/components/DialogFooter";

import "./Dialog.css";

class Dialog extends Component {
  render() {
    const {
      className,
      isModal,        // set to `true` to disable escape key/overlay click close
      isOpen,
      portalProps,    // spread into Portal component
      onClose,        // close the dialog
      headerControls, // additional controls rendered in the header
      footerControls, // additional controls rendered in the footer
      controls,       // rendered as children in DialogFooter.jsx
      onDelete,       // callback function passed to DialogFooter.jsx
      onSave,         // callback function passed to DialogFooter.jsx
      title,          // dialog title
      titleHidden,
      children        // main message
    } = this.props;

    // don't render unless isOpen is true
    if (isOpen === false || isOpen === null || typeof isOpen === "undefined") return null;

    // also don't render unless we have onClose
    else if (isOpen === true && !onClose) {
      console.log("missing `onClose` prop in Dialog.jsx");
      return null;
    }

    let showFooter = false;
    if (onSave || controls) showFooter = true;

    let Wrapper = Fragment;
    if (isModal) Wrapper = Portal;

    return (
      <Wrapper {...portalProps}>
        <div
          className={`cms-dialog${className ? ` ${className}` : ""} ${isModal ? "is-modal" : "is-inline"}`}
          key="a"
        >
          <div className={`cms-dialog-inner${showFooter ? " with-footer" : ""}`}>
            <div className={`cms-dialog-header${titleHidden ? " title-hidden" : ""}`}>
              <Parse El="h2" className="cms-dialog-heading u-font-md u-margin-top-off">{title}</Parse>
              {headerControls}
              <Button className="cms-dialog-header-button" namespace="cms" onClick={onClose} icon="cross" iconOnly>Cancel</Button>
            </div>

            {/* main dialog content */}
            <div className="cms-dialog-body">
              {children}
            </div>

            {/* footer buttons */}
            {showFooter &&
              <DialogFooter onSave={onSave} onDelete={onDelete} key="f">
                {footerControls}
              </DialogFooter>
            }
          </div>

          {/* overlay */}
          {isModal &&
            <button
              className="cms-dialog-overlay cms-overlay"
              onClick={onClose}
              onFocus={onClose}
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

Dialog.defaultProps = {
  isModal: true,
  title: "missing `title` prop in Dialog.jsx",
  titleHidden: false
};

export default hot(Dialog);
