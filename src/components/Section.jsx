import React, {Component} from "react";
import "./Section.css";

class Section extends Component {

  getChildContext() {
    return {
      slug: this.props.slug || this.context.slug || this._reactInternalInstance._currentElement.type.name
    };
  }

  render() {
    const {children, type} = this.props;
    const title = children.filter(c => c.type.displayName === "SectionTitle");
    const content = children.filter(c => c.type.displayName !== "SectionTitle");
    return (
      <section>
        { title.length ? title : null }
        <div className={ type }>{ content }</div>
      </section>
    );
  }

}

Section.childContextTypes = {
  slug: React.PropTypes.string
};

Section.contextTypes = {
  data: React.PropTypes.object,
  slug: React.PropTypes.string
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

export default Section;
export {Section, SectionColumns, SectionRows};
