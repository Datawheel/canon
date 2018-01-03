import React, {Component} from "react";
import Helmet from "react-helmet";

class Canon extends Component {
  render() {
    const {children, config, locale} = this.props;
    return <div id="Canon">
      <Helmet
        htmlAttributes={{lang: locale, amp: undefined}}
        defaultTitle={config.title}
        titleTemplate={ `%s | ${config.title}` }
        meta={config.meta}
        link={config.link} />
      { children }
    </div>;
  }
}

export default Canon;
