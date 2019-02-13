import React, {Component} from "react";
import PropTypes from "prop-types";

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
    const thisLocale = data.content.find(c => c.lang === locale);
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

    const thisLocale = data.content.find(c => c.lang === locale); 

    const inputs = fields.map(f =>
      <div key={f}>
        <label htmlFor={f}>{f}</label>
        <input id={f} className="bp3-input" type="text" value={thisLocale[f]} onChange={this.changeField.bind(this, f)}/>
      </div>
    );

    return (
      <div id="text-editor">
        {inputs}
      </div>
    );
  }
}

PlainTextEditor.contextTypes = {
  formatters: PropTypes.object
};

export default PlainTextEditor;
