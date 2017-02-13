import React, {Component} from "react";
import "./Section.css";

class Section extends Component {
  render() {
    const {children, title, type} = this.props;
    return (
      <section>
        { title ? <h3>{ title }</h3> : null }
        <div className={ type }>{ children }</div>
      </section>
    );
  }
}
Section.defaultProps = {type: "columns"};
export default Section;

class SectionColumns extends Section {}
SectionColumns.defaultProps = {type: "columns"};

class SectionRows extends Section {}
SectionRows.defaultProps = {type: "rows"};

export {Section, SectionColumns};
