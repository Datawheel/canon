import React, {Component} from "react";
import {hot} from "react-hot-loader/root";

import "./Mirror.css";

/**
* Render a dummy version of a visualization or section offscreen.
* Used by the save image function in Options.jsx.
* Much of the footer content is currently unused, but in the future we could render content into it.
*/
class Mirror extends Component {
  render() {
    const {inUse} = this.props;
    return (
      <div className={`mirror ${inUse ? "is-visible" : "is-hidden"}`} aria-hidden="true">
        <div className="mirror-inner">
          <div className="mirror-content">
            <div className="mirror-content-inner" />
          </div>
          <div className="mirror-footer">
            <div className="mirror-footer-text">
              <p className="mirror-footer-text-description u-font-sm" aria-hidden="true" />
              <p className="mirror-footer-text-url u-font-xxs u-margin-bottom-off" aria-hidden="true" />
            </div>
            <div className="mirror-footer-logo" />
          </div>
        </div>
      </div>
    );
  }
}

Mirror.defaultProps = {
  inUse: false
};

export default hot(Mirror);
