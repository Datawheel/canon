import React, {Component} from "react";
import QuillWrapper from "./QuillWrapper";
import DraftWrapper from "./DraftWrapper";
import PropTypes from "prop-types";

import upperCaseFirst from "../../utils/formatters/upperCaseFirst";
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
    /*

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

    */

    //console.log(data.content);
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
    const {contentType, variables, locale} = this.props;
    const formatters = this.context.formatters[locale];

    if (!data || !fields || !variables || !formatters) return null;

    const thisLocale = data.content.find(c => c.locale === locale);

    const quills = fields.map(f =>
      <div className="cms-field-container" key={f}>
        <label htmlFor={f}>{formatFieldName(f, contentType.replace("story_", "").replace("section_", "")
        )}</label>        
        <DraftWrapper id={f} variables={variables} defaultValue={thisLocale[f] || ""} onChange={this.handleEditor.bind(this, f)} />
      </div>
    );

    return (
      <div id="text-editor">

        {quills}

      </div>
    );
  }
}

TextEditor.contextTypes = {
  formatters: PropTypes.object
};

export default TextEditor;
