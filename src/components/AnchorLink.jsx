import React, {Component} from "react";
import PropTypes from "prop-types";

class AnchorLink extends Component {

  onClick(e) {
    const {router} = this.context;
    if (router) {
      const {to} = this.props;
      e.preventDefault();
      router.push({...router.location, state: "HASH", hash: `#${to}`});
    }
  }

  render() {
    const {children, className, to} = this.props;
    return <a className={className} href={ `#${to}` } onClick={this.onClick.bind(this)}>{ children }</a>;
  }

}

AnchorLink.contextTypes = {
  router: PropTypes.object
};

export {AnchorLink};
