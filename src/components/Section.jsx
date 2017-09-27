import React, {Component} from "react";
import PropTypes from "prop-types";

import "./Section.css";

class Section extends Component {

  getChildContext() {
    return {slug: this.props.slug || this.context.slug};
  }

  render() {

    const {type} = this.props;
    let {children} = this.props;
    if (!(children instanceof Array)) children = [children];
    const title = children.filter(c => c.type.name === "SectionTitle");
    const content = children.filter(c => c.type.name !== "SectionTitle");

    return (
      <section className="section">
        { title.length ? title : null }
        <div className={ type }>{ content }</div>
      </section>
    );

  }

}

Section.childContextTypes = {
  slug: PropTypes.string
};

Section.contextTypes = {
  data: PropTypes.object,
  slug: PropTypes.string
};

Section.defaultProps = {
  type: "columns"
};

class SectionColumns extends Section {}
SectionColumns.defaultProps = {
  type: "columns"
};

class SectionRows extends Section {}
SectionRows.defaultProps = {
  type: "rows"
};

export {Section, SectionColumns, SectionRows};
