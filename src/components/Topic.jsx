import React, {Component} from "react";
import "./Topic.css";

class Topic extends Component {

  render() {
    const {children, slug} = this.props;
    return <h2 className="topicTitle"><a name={ slug } href={ `#${ slug }`}>{ children }</a></h2>;
  }

}

Topic.defaultProps = {slug: ""};
export default Topic;
export {Topic};
