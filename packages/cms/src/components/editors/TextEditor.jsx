import React, {Component} from "react";
import QuillWrapper from "./QuillWrapper";
import {connect} from "react-redux";

import formatFieldName from "../../utils/formatters/formatFieldName";

import "./TextEditor.css";

class TextEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      fields: null,
      isDirty: false
    };
  }

  componentDidMount() {
    const {data, fields} = this.props;
    this.setState({data, fields});
  }

  handleEditor(field, t) {
    const {data, isDirty} = this.state;
    const {locale} = this.props;
    const thisLocale = data.content.find(c => c.locale === locale);
    // When an editor loads a raw string from the DB (like "new title") then the first
    // thing it does is surround it in p tags, which counts as an "edit" and marks the
    // editor as dirty. Don't mark dirty in this case.
    const isFirstLoad = t === `<p>${thisLocale[field]}</p>`;
    const isSame = t === thisLocale[field];
    thisLocale[field] = t;
    if (!isDirty && !isFirstLoad && !isSame) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  render() {

    const {data, fields} = this.state;
    const {contentType, locale} = this.props;
    // Stories use TextEditors, but don't need variables.
    const variables = this.props.status.variables[locale] ? this.props.status.variables[locale] : {};

    if (!data || !fields || !variables) return null;

    const thisLocale = data.content.find(c => c.locale === locale);

    const quills = fields.map(f =>
      <div className="cms-field-container" key={f}>
        <label htmlFor={f}>{formatFieldName(f, contentType.replace("story_", "").replace("section_", "")
        )}</label>
        <QuillWrapper id={f} value={thisLocale[f] || ""} onChange={this.handleEditor.bind(this, f)} />
      </div>
    );

    return (
      <div id="text-editor">

        {quills}

      </div>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status
});

export default connect(mapStateToProps)(TextEditor);
