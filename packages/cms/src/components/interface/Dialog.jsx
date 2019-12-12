import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

import Portal from "./Portal";
import Button from "../fields/Button";
import Parse from "../sections/components/Parse";
import DialogFooter from "../editors/components/DialogFooter";

import "./Dialog.css";

class Dialog extends Component {
  constructor(props) {
    super(props);
    this.title = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const {isOpen} = this.props;
    // when opening the dialog, focus the title
    if (!prevProps.isOpen && isOpen) {
      // after .is-animating is removed from portal
      setTimeout(() => this.title.current.focus(), 200);
    }
  }

  // listen for escape key
  handleKeyPress(e) {
    const {onClose} = this.props;

    const esc = 27;
    if (e.keyCode === esc && onClose) onClose();

    else {
      const target = e.currentTarget;
      setTimeout(() => target.focus());
    }
  }

  render() {
    const {
      className,
      usePortal,      // good luck
      isModal,        // not inline
      isOpen,
      portalProps,    // spread into Portal component
      onClose,        // close the dialog
      onDelete,       // callback function passed to DialogFooter.jsx
      onSave,         // callback function passed to DialogFooter.jsx
      headerControls, // additional controls rendered in the header
      footerControls, // additional controls rendered in the footer
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
    if (onSave || footerControls) showFooter = true;

    let Wrapper = Fragment;
    if (usePortal) Wrapper = Portal;

    return (
      <Wrapper {...portalProps} key="dw">
        <div
          className={`cms-dialog${className ? ` ${className}` : ""} ${isModal ? "is-modal" : "is-inline"}${usePortal ? " in-portal" : ""}`}
          onKeyDown={this.handleKeyPress.bind(this)}
          key="a"
        >
          <div className={`cms-dialog-inner${showFooter ? " with-footer" : ""}`}>
            <div className={`cms-dialog-header${titleHidden ? " title-hidden" : ""}`}>
              <h2 className="cms-dialog-heading u-font-md u-margin-top-off" tabIndex="0" ref={this.title} key="h">
                <Parse El="span">
                  {title}
                </Parse>
              </h2>
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
