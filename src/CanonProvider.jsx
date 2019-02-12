import React, {Component} from "react";
import {match} from "react-router";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Loading from "components/Loading";
import d3plus from "d3plus.js";
import Helmet from "react-helmet";
import urllite from "urllite";

class CanonProvider extends Component {

  getChildContext() {
    const {data, helmet, locale, router} = this.props;
    return {d3plus, data, helmet, locale, router};
  }

  componentDidMount() {
    // polyfill for IE to support SVG innerHTML
    if (typeof window !== "undefined") {
      (function() {
        function serializeXML(node, output) {
          const nodeType = node.nodeType;
          if (nodeType === 3) {
            output.push(node.textContent.replace(/&/, "&amp;").replace(/</, "&lt;").replace(">", "&gt;"));
          }
          else if (nodeType === 1) {
            output.push("<", node.tagName);
            if (node.hasAttributes()) {
              [].forEach.call(node.attributes, attrNode => {
                output.push(" ", attrNode.item.name, "=\'", attrNode.item.value, "\'");
              });
            }
            if (node.hasChildNodes()) {
              output.push(">");
              [].forEach.call(node.childNodes, childNode => {
                serializeXML(childNode, output);
              });
              output.push("</", node.tagName, ">");
            }
            else {
              output.push("/>");
            }
          }
          else if (nodeType === 8) {
            output.push("<!--", node.nodeValue, "-->");
          }
        }

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
            while (this.firstChild) {
              this.removeChild(this.firstChild);
            }

            try {
              const dXML = new DOMParser();
              dXML.async = false;

              const sXML = `<svg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\'>${markupText}</svg>`;
              const svgDocElement = dXML.parseFromString(sXML, "text/xml").documentElement;

              let childNode = svgDocElement.firstChild;
              while (childNode) {
                this.appendChild(this.ownerDocument.importNode(childNode, true));
                childNode = childNode.nextSibling;
              }
            }
            catch (e) {
              console.error(e);
            }
          }
        });

        Object.defineProperty(SVGElement.prototype, "innerSVG", {
          get() {
            return this.innerHTML;
          },
          set(markup) {
            this.innerHTML = markup;
          }
        });

      }());
    }
  }

  onClick(e) {

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
      else if (props) push(url.pathname);
      else window.location.href = el.href;
    });

  }

  render() {

    const {children, helmet, loading, locale} = this.props;

    return <div id="Canon" onClick={this.onClick.bind(this)}>
      <Helmet
        htmlAttributes={{lang: locale, amp: undefined}}
        defaultTitle={helmet.title}
        titleTemplate={`%s | ${helmet.title}`}
        meta={helmet.meta}
        link={helmet.link}
      />
      { loading ? <Loading /> : children }
    </div>;
  }
}

CanonProvider.childContextTypes = {
  data: PropTypes.object,
  d3plus: PropTypes.object,
  helmet: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object
};

CanonProvider.defaultProps = {
  helmet: {},
  data: {}
};

CanonProvider = connect(state => ({
  data: state.data,
  loading: state.loading
}))(CanonProvider);

export default CanonProvider;
