import React, {Component} from "react";
import {AnchorLink} from "./AnchorLink";
import "./TopicTitle.css";

class TopicTitle extends Component {

  render() {
    const {children, slug} = this.props;
    return (
      <h2 className="topic-title">
        <AnchorLink to={ slug } id={ slug } className="anchor">
          { children }
        </AnchorLink>
      </h2>
    );
  }

}

TopicTitle.defaultProps = {slug: ""};
export {TopicTitle};
