import React, {Component} from "react";
import "./TopicTitle.css";

class TopicTitle extends Component {

  render() {
    const {children, slug} = this.props;
    return (
      <h2 className="topic-title">
        <a href={ `#${ slug }`} id={ slug } className="anchor">
          { children }
        </a>
      </h2>
    );
  }

}

TopicTitle.defaultProps = {slug: ""};
export {TopicTitle};
