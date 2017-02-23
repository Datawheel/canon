import React, {Component} from "react";
import "./SectionTitle.css";

class SectionTitle extends Component {

  render() {
    const {children} = this.props;
    const {slug} = this.context;
    console.log("SectionTitle", slug);
    return <h4 className="sectionTitle"><a name={ slug } href={ `#${ slug }`}>{ children }</a></h4>;
  }

}

SectionTitle.contextTypes = {
  slug: React.PropTypes.string
};

export default SectionTitle;
export {SectionTitle};
