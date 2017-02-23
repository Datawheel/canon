import React, {Component} from "react";
import "./TopicTitle.css";

class TopicTitle extends Component {

  render() {
    const {children, slug} = this.props;
    return <h2 className="topicTitle"><a name={ slug } href={ `#${ slug }`}>{ children }</a></h2>;
  }

}

TopicTitle.defaultProps = {slug: ""};
export default TopicTitle;
export {TopicTitle};
