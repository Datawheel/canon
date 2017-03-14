import React, {Component} from "react";
import {Link} from "react-router";
import "./TopicTitle.css";

class TopicTitle extends Component {

  render() {
    const {children, slug} = this.props;
    return (
      <h2 className="topic-title">
        <Link to={ `#${ slug }`} id={ slug } className="anchor">
          { children }
        </Link>
      </h2>
    );
  }

}

TopicTitle.defaultProps = {slug: ""};
export default TopicTitle;
export {TopicTitle};
