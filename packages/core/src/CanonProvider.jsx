import React, {PureComponent, createContext} from "react";
import {match} from "react-router";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import Loading from "$app/components/Loading";
import d3plus from "$app/d3plus.js";
import {Helmet} from "react-helmet-async";
import urllite from "urllite";
import {Portal, Toaster} from "@blueprintjs/core";
import {titleCase} from "d3plus-text";
import "./CanonProvider.css";

// New Functional/Hooks Context - works in parallel with legacy context. Taken from
// https://martinratinaud.medium.com/use-usecontext-with-legacy-react-context-api-a09fcfc8a541
export const AppContext = createContext({});

// returns true if an element is either a specific semantic tag or has an id attribute,
// which determines if the element should send a click event to Google Analytics
const clickElement = elem => ["nav", "footer"].includes(elem.tagName.toLowerCase()) || elem.id;

/**
blueprint tooltip IE fix; check that the window exists and that we're in IE first
related issue: https://github.com/DataScienceSquad/open-compass/issues/247
*/
if (typeof window !== "undefined" && typeof document !== "undefined" && (/*@cc_on!@*/false || !!document.documentMode)) require("dom4"); // eslint-disable-line spaced-comment

class CanonProvider extends PureComponent {

  constructor(props) {

    super(props);
    this.toastRef = React.createRef();

    if (typeof window !== "undefined") {

      /**
       * innerHTML property for SVGElement
       * Copyright(c) 2010, Jeff Schiller
       *
       * Licensed under the Apache License, Version 2
       *
       * Minor modifications by Chris Price to only polyfill when required.
       */
      (function(SVGElement) {

        if (!SVGElement || "innerHTML" in SVGElement.prototype) {
          return;
        }

        /** serializeXML polyfill */
        function serializeXML(node, output) {
          const nodeType = node.nodeType;
          if (nodeType === 3) { // TEXT nodes.
            // Replace special XML characters with their entities.
            output.push(node.textContent.replace(/&/, "&amp;").replace(/</, "&lt;").replace(">", "&gt;"));
          }
          else if (nodeType === 1) { // ELEMENT nodes.
            // Serialize Element nodes.
            output.push("<", node.tagName);
            if (node.hasAttributes()) {
              const attrMap = node.attributes;
              for (let i = 0, len = attrMap.length; i < len; ++i) {
                const attrNode = attrMap.item(i);
                output.push(" ", attrNode.name, "='", attrNode.value, "'");
              }
            }
            if (node.hasChildNodes()) {
              output.push(">");
              const childNodes = node.childNodes;
              for (let i = 0, len = childNodes.length; i < len; ++i) {
                serializeXML(childNodes.item(i), output);
              }
              output.push("</", node.tagName, ">");
            }
            else {
              output.push("/>");
            }
          }
          else if (nodeType == 8) {
            // TODO(codedread): Replace special characters with XML entities?
            output.push("<!--", node.nodeValue, "-->");
          }
          else {
            // TODO: Handle CDATA nodes.
            // TODO: Handle ENTITY nodes.
            // TODO: Handle DOCUMENT nodes.
            throw `Error serializing XML. Unhandled node of type: ${nodeType}`;
          }
        }

        // The innerHTML DOM property for SVGElement.
        Object.defineProperty(SVGElement.prototype, "innerHTML", {
          get() {
            const output = [];
            let childNode = this.firstChild;
            while (childNode) {
              serializeXML(childNode, output);
              childNode = childNode.nextSibling;
            }
            return output.join("");
          },
          set(markupText) {
            // Wipe out the current contents of the element.
            while (this.firstChild) {
              this.removeChild(this.firstChild);
            }

            try {
              // Parse the markup into valid nodes.
              const dXML = new DOMParser();
              dXML.async = false;
              // Wrap the markup into a SVG node to ensure parsing works.
              const sXML = `<svg xmlns='http://www.w3.org/2000/svg'>${  markupText  }</svg>`;
              const svgDocElement = dXML.parseFromString(sXML, "text/xml").documentElement;

              // Now take each node, import it and append to this element.
              let childNode = svgDocElement.firstChild;
              while (childNode) {
                this.appendChild(this.ownerDocument.importNode(childNode, true));
                childNode = childNode.nextSibling;
              }
            }
            catch (e) {
              throw new Error("Error parsing XML string");
            }
          }
        });

      }((1, eval)("this").SVGElement));
    }

  }

  getChildContext() {
    const {data, helmet, locale, router} = this.props;
    const toast = this.toastRef;
    return {d3plus, data, helmet, locale, router, toast};
  }

  onClick(e) {

    if (typeof window.ga === "function") {

      const clickEl = e.target;

      let eventEl = clickEl;
      while (eventEl !== document.body && !clickElement(eventEl)) eventEl = eventEl.parentNode;

      if (clickElement(eventEl)) {

        const category = eventEl.id ? `#${eventEl.id}` : eventEl.tagName.toLowerCase();
        const action = "Click";
        const label = clickEl.innerText ||
          clickEl.alt ||
          clickEl.id ||
          clickEl.className ||
          `<${clickEl.tagName.toLowerCase()}>`;

        const trackers = window.ga.getAll().map(t => t.get("name"));
        trackers
          .forEach(key => {
            window.ga(`${key}.send`, "event", category, action, label);
          });
      }

    }

    // Ignore canceled events, modified clicks, and right clicks.
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.button !== 0) return;

    // Get the <a> element.
    let el = e.target;
    while (el && el.nodeName !== "A") el = el.parentNode;

    // Ignore clicks from non-a elements.
    if (!el) return;

    // Ignore the click if the element has a target.
    if (el.target && el.target !== "_self") return;

    // Ignore the click if it's a download link. (We use this method of
    // detecting the presence of the attribute for old IE versions.)
    if (el.attributes.download) return;

    // Allow links to refresh the page if a "data-refresh" attribute
    // is present.
    if (el.attributes["data-refresh"]) return;

    // Ignore hash (used often instead of javascript:void(0) in strict CSP envs)
    if (el.getAttribute("href") === "#") return;

    // Use a regular expression to parse URLs instead of relying on the browser
    // to do it for us (because IE).
    const url = urllite(el.href);
    const windowURL = urllite(window.location.href);

    // Ignore links that don't share a protocol and host with ours.
    if (url.protocol !== windowURL.protocol || url.host !== windowURL.host) return;

    // Ignore 'rel="external"' links.
    if (el.rel && (/(?:^|\s+)external(?:\s+|$)/).test(el.rel)) return;

    // Prevent :focus from sticking; preventDefault() stops blur in some browsers
    el.blur();
    e.preventDefault();

    const {push, routes} = this.props.router;

    const serverRoutes = ["/auth/logout"];
    match({location: url, routes}, (err, redirect, props) => {
      if (err) console.error(err);
      if (serverRoutes.includes(url.pathname)) window.location.href = el.href;
      else if (props) push(`${url.pathname}${url.search}${url.hash}`);
      else window.location.href = el.href;
    });

  }

  render() {

    const {children, gdpr, helmet, loading, locale, privacy, services, t} = this.props;

    return <AppContext.Provider value={this.getChildContext()}>
      <div id="Canon" onClick={this.onClick.bind(this)}>
        <Helmet
          htmlAttributes={{lang: locale, amp: undefined}}
          defaultTitle={helmet.title}
          titleTemplate={`%s | ${helmet.title}`}
          meta={helmet.meta}
          link={helmet.link}
        />
        { loading ? <Loading /> : <div>{ children }</div> }
        <Portal>
          <Toaster ref={this.toastRef} />
        </Portal>
        { gdpr ? <div id="cookies-eu-banner" style={{display: "none"}}>
          <span id="cookies-eu-desc">{t("GDPR.desc", {services})}</span>
          { privacy ? <a href={privacy} id="cookies-eu-more">{t("GDPR.more")}</a> : null }
          <button id="cookies-eu-reject" className="bp3-button">{t("GDPR.reject")}</button>
          <button id="cookies-eu-accept" className="bp3-button">{t("GDPR.accept")}</button>
        </div> : null }
      </div>
    </AppContext.Provider>;
  }
}

CanonProvider.childContextTypes = {
  data: PropTypes.object,
  d3plus: PropTypes.object,
  helmet: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object,
  toast: PropTypes.object
};

CanonProvider.defaultProps = {
  helmet: {},
  data: {}
};

export default withNamespaces()(
  connect(state => {
    const servicesNames = state.services.map(s => titleCase(s.replace(/\_/g, " ")));
    return {
      data: state.data,
      gdpr: state.env.CANON_GDPR,
      loading: state.loading,
      privacy: state.legal.privacy,
      services: servicesNames
    };
  })(CanonProvider)
);
