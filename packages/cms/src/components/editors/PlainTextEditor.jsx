import React, {Component} from "react";
import PropTypes from "prop-types";

import TextInput from "../fields/TextInput";
import "./PlainTextEditor.css";

class PlainTextEditor extends Component {

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

  changeField(field, e) {
    const {isDirty, data} = this.state;
    const {locale} = this.props;
    const thisLocale = data.content.find(c => c.locale === locale);
    thisLocale[field] = e.target.value;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
    this.setState({data});
  }

  render() {

    const {data, fields} = this.state;
    const {locale} = this.props;

    if (!data || !fields) return null;

    const thisLocale = data.content.find(c => c.locale === locale);

    return (
      <div className="cms-plaintext-editor">
        {fields.map(f =>
          <TextInput
            label={f}
            inline
            namespace="cms"
            value={thisLocale[f]}
            onChange={this.changeField.bind(this, f)}
            key={f}
          />
        )}
      </div>
    );
  }
}

PlainTextEditor.contextTypes = {
  formatters: PropTypes.object
};

export default PlainTextEditor;
