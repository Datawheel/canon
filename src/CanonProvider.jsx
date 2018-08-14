import React, {Component} from "react";
import {match} from "react-router";
import PropTypes from "prop-types";
import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import urllite from "urllite";

class CanonProvider extends Component {

  getChildContext() {
    const {helmet, locale} = this.props;
    return {helmet, locale};
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

    match({location: url, routes}, (err, redirect, props) => {
      if (err) console.error(err);
      if (props) push(url.pathname);
      else window.location.href = el.href;
    });

  }

  render() {
    const {children, i18n, store} = this.props;
    return <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <div id="Canon" onClick={this.onClick.bind(this)}>
          { children }
        </div>
      </Provider>
    </I18nextProvider>;
  }
}

CanonProvider.childContextTypes = {
  helmet: PropTypes.object,
  locale: PropTypes.string
};

CanonProvider.defaultProps = {
  helmet: {}
};

export default CanonProvider;
