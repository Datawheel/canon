import React, {Component} from "react";
import PropTypes from "prop-types";

import "./SectionTitle.css";

class SectionTitle extends Component {

  render() {

    const {children} = this.props;
    const {slug} = this.context;

    return (
      <h4 className="section-title">
        <a href={ `#${ slug }`} id={ slug } className="anchor">
          { children }
        </a>
      </h4>
    );

  }

}

SectionTitle.contextTypes = {
  slug: PropTypes.string
};

export {SectionTitle};
