import React, {Component} from "react";
import ReactDOM from "react-dom";
import {hot} from "react-hot-loader/root";

import "./Portal.css";

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
    const {children, namespace, rootElementSelector} = this.props;
    const {rootEl, portalEl} = this.state;

    // log errors
    if (!portalEl || !rootEl) {
      console.log(`rootElementSelector ${rootElementSelector} not found (Portal.jsx)`);
      return null;
    }

    // add classes to root element & portal element
    if (rootEl) rootEl.classList.add("with-portal");
    if (portalEl) portalEl.className = namespace ? `${namespace}-portal` : "portal";

    // append the portal element to the document
    if (rootEl && portalEl) rootEl.appendChild(portalEl);

    return ReactDOM.createPortal(children, portalEl);
  }
}

Portal.defaultProps = {
  rootElementSelector: ".cms"
};

export default hot(Portal);
