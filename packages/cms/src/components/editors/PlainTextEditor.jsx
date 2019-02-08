import React, {Component} from "react";
import PropTypes from "prop-types";

class PlainTextEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      fields: null
    };
  }

  componentDidMount() {
    const {data, fields} = this.props;
    this.setState({data, fields});
  }

  changeField(field, e) {
    const {data} = this.state;
    const {locale} = this.props;
    const thisLocale = data.content.find(c => c.lang === locale);
    thisLocale[field] = e.target.value;
    this.setState({data});
  }

  render() {

    const {data, fields} = this.state;

    if (!data || !fields) return null;

    const inputs = fields.map(f =>
      <div key={f}>
        <label htmlFor={f}>{f}</label>
        <input id={f} className="bp3-input" type="text" value={data[f]} onChange={this.changeField.bind(this, f)}/>
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
