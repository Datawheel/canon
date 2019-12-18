import React, {Component} from "react";
import DraftWrapper from "./DraftWrapper";
import {connect} from "react-redux";

import formatFieldName from "../../utils/formatters/formatFieldName";

import "./RichTextEditor.css";

class RichTextEditor extends Component {
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
    if (!isDirty && thisLocale[field] !== t) {
      thisLocale[field] = t;
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      thisLocale[field] = t;
      this.setState({data});
    }
  }

  render() {
    const {data, fields} = this.state;
    const {contentType, locale} = this.props;
    // Stories use TextEditors, but don't need variables.
    const variables = this.props.status.variables[locale] ? this.props.status.variables[locale] : {};
    const {formatters, selectors} = this.props;

    if (!data || !fields || !variables) return null;

    const thisLocale = data.content.find(c => c.locale === locale);

    return (
      <div className="cms-rich-text-editor">
        {fields.map(f =>
          <div className="cms-field-container" key={f}>
            <label htmlFor={f}>
              {formatFieldName(f, contentType.replace("story_", "").replace("section_", ""))}
            </label>
            <DraftWrapper
              id={f}
              selectors={selectors}
              formatters={formatters}
              variables={variables}
              defaultValue={thisLocale[f] || ""}
              onChange={this.handleEditor.bind(this, f)}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status,
  formatters: state.cms.formatters,
  selectors: state.cms.status.currentPid ? state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors : []
});

export default connect(mapStateToProps)(RichTextEditor);
