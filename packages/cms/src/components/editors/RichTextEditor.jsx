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
    this.editors = {};

    /** Note 1: This component receives props and (incorrectly) copies them into state without cloning. This means that when
     * handleEditor is firing, updates to state occur directly on props. Even though this is a React anti-pattern, it allows
     * the parent TextCard to, on save, have the object it passed down represent the current RTE state of the object, without a callback.
     * Thus, when TextCard uses "this.state.minData" for saving, it is an object that has been updated by *this* component
     * Note 2: The embedded Draftjs editor here is uncontrolled, meaning its default value is set, and then unmanaged thereafter.
     * The handleEditor callback is not linked to the state of Draftjs - draftjs is managing its own state - but handleEditor is necessary
     * so that the actual object gets updated, so when save is pressed (see above) the object has been updated by the text window.
     * Note 3: This leads to the problem: How can TextCard, upon receiving a translation from an axios call, inject it into a DraftWrapper?
     * ComponentDidUpdate is firing _every_ time because (see note 1) we are editing the props directly. There is no way to tell the difference
     * between a draftjs keystroke making a handleEditor "prop loop" and TextCard forcing a new prop in from scratch. To address this, expose a
     * reload method that reaches into the draftjs ref and forces a reload from props. TODO: improve this.
     */

    this.reload = () => {
      Object.values(this.editors).forEach(editor => {
        editor.reload();
      });
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
    const variables = this.props.variables[locale] || {};
    const {formatters, selectors} = this.props;

    if (!data || !fields || !variables) return null;

    const thisLocale = data.content.find(c => c.locale === locale);

    return (
      <div className="cms-rich-text-editor">
        {fields.map(f =>
          <div className="cms-field-container" key={f}>
            <label key="l" htmlFor={f}>
              {formatFieldName(f, contentType.replace("story_", "").replace("section_", ""))}
            </label>
            <DraftWrapper
              id={f}
              dir={["ar", "he"].includes(locale) ? "rtl" : "ltr"}
              key="dw"
              selectors={selectors}
              formatters={formatters}
              variables={variables}
              defaultValue={thisLocale[f] || ""}
              onChange={this.handleEditor.bind(this, f)}
              showToolbar={this.props.status.showToolbar}
              ref={c => this.editors[f] = c}
            />
          </div>
        )}

        <p className="cms-rich-text-help u-font-xs">
          <span className="heading">Pro tip: </span>
          You can type
          <code className="cms-rich-text-code cms-variable-code">{"{{variable name}}"}</code>,
          <code className="cms-rich-text-code cms-selector-code">[[selector name]]</code>, or
          <code className="cms-rich-text-code cms-formatter-code">@formatter name</code>
          for a list of respective entities.
        </p>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  variables: state.cms.variables,
  status: state.cms.status,
  formatters: state.cms.formatters,
  selectors: state.cms.status.currentPid ? state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors : []
});

export default connect(mapStateToProps, null, null, {forwardRef: true})(RichTextEditor);
