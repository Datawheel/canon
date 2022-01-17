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
    const {children, className, dangerouslySetInnerHTML, id, to} = this.props;

    if (dangerouslySetInnerHTML) {
      return <a className={className}
        href={ `#${to}` }
        id={ id }
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        onClick={this.onClick.bind(this)}
        onBlur={this.props.onBlur}
        onFocus={this.props.onFocus}></a>;
    }
    else {
      return <a className={className}
        href={ `#${to}` }
        id={ id }
        onClick={this.onClick.bind(this)}
        onBlur={this.props.onBlur}
        onFocus={this.props.onFocus}>
        { children }
      </a>;
    }

  }

}

AnchorLink.contextTypes = {
  router: PropTypes.object
};

export {AnchorLink};
