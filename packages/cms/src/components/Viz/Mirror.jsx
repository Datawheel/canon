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
        <div className="mirror-content" />
        <div className="mirror-footer">
          <div className="mirror-footer-text">
            <p className="mirror-footer-text-description u-font-sm" aria-hidden="true">Hi how are you Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos fuga, veritatis excepturi facilis, ratione tempore eius odit iusto doloremque nemo repudiandae consequuntur harum cupiditate a, molestias iure aspernatur sapiente distinctio!</p>
            <p className="mirror-footer-text-url u-font-xxs u-margin-bottom-off" aria-hidden="true">www.butts.com</p>
          </div>
          <div className="mirror-footer-logo" />
        </div>
      </div>
    );
  }
}

Mirror.defaultProps = {
  inUse: false
};

export default hot(Mirror);
