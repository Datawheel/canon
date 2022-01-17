import React, {Component} from "react";
import {AnchorLink} from "./AnchorLink";
import PropTypes from "prop-types";

import "./SectionTitle.css";

class SectionTitle extends Component {

  render() {

    const {children} = this.props;
    const {slug} = this.context;

    return (
      <h4 className="section-title">
        <AnchorLink to={ slug } id={ slug } className="anchor">
          { children }
        </AnchorLink>
      </h4>
    );

  }

}

SectionTitle.contextTypes = {
  slug: PropTypes.string
};

export {SectionTitle};
