import React, {Component} from "react";
import ReactDOM from "react-dom";
import {hot} from "react-hot-loader/root";

/** adds a portal for rendering alerts & dialogs */
class Portal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rootEl: document.querySelector(this.props.rootElementSelector),
      portalEl: document.createElement("div")
    };
  }

  componentWillUnmount() {
    const {rootEl, portalEl} = this.state;
    if (rootEl) rootEl.removeChild(portalEl);
  }

  render() {
    const {children, rootElementSelector} = this.props;
    const {rootEl, portalEl} = this.state;

    if (rootEl && portalEl) rootEl.appendChild(portalEl);

    if (!portalEl || !rootEl) {
      console.log(`rootElementSelector ${rootElementSelector} not found (Portal.jsx)`);
      return null;
    }
    return ReactDOM.createPortal(children, portalEl);
  }
}

Portal.defaultProps = {
  rootElementSelector: ".cms"
};

export default hot(Portal);
