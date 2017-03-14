import React, {Component} from "react";
import "./SectionTitle.css";

class SectionTitle extends Component {

  render() {

    const {children} = this.props;
    const {slug} = this.context;

    return (
      <h4 className="section-title">
        <a id={ slug } to={ `#${ slug }`} className="anchor">
          { children }
        </a>
      </h4>
    );

  }

}

SectionTitle.contextTypes = {
  slug: React.PropTypes.string
};

export default SectionTitle;
export {SectionTitle};
