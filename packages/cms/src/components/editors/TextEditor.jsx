import React, {Component} from "react";
import QuillWrapper from "./QuillWrapper";
import PropTypes from "prop-types";

import "./TextEditor.css";

class TextEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      fields: null,
      isDirty: false

      /*
      currentVariable: "choose-a-variable",
      currentFormatter: "choose-a-formatter"
      */
    };
  }

  componentDidMount() {
    const {data, fields} = this.props;
    this.setState({data, fields});
  }

  handleEditor(field, t) {
    const {data, isDirty} = this.state;
    const {locale} = this.props;
    const thisLocale = data.content.find(c => c.lang === locale);
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

  chooseVariable(e) {
    const {isDirty, data} = this.state;
    data.allowed = e.target.value;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  /*
  chooseVariable(e) {
    this.setState({currentVariable: e.target.value});
  }

  chooseFormatter(e) {
    this.setState({currentFormatter: e.target.value});
  }

  insertVariable() {
    const {currentVariable, currentFormatter} = this.state;
    console.log("would insert", currentVariable, currentFormatter);
  }*/

  render() {

    const {data, fields} = this.state;
    const {variables, locale} = this.props;
    const formatters = this.context.formatters[locale];

    if (!data || !fields || !variables || !formatters) return null;

    const thisLocale = data.content.find(c => c.lang === locale);

    const quills = fields.map(f =>
      <div className="cms-field-container" key={f}>
        <label htmlFor={f}>{f}</label>
        <QuillWrapper id={f} value={thisLocale[f] || ""} onChange={this.handleEditor.bind(this, f)} />
      </div>
    );

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    const showVars = Object.keys(variables).length > 0;

    return (
      <div id="text-editor">
        { showVars &&
          <label className="cms-field-container">
            Allowed?
            <div className="bp3-select">
              <select value={data.allowed || "always"} onChange={this.chooseVariable.bind(this)}>
                {varOptions}
              </select>
            </div>
          </label>
        }
        {/*
        <div className="bp3-select">
          <select onChange={this.chooseFormatter.bind(this)}>
            <option key="choose-a-formatter" value="choose-a-formatter">Choose a Formatter</option>
            {Object.keys(formatters).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button className="bp3-button bp3-intent-success" onClick={this.insertVariable.bind(this)}>Insert</button>
        */}

        {quills}

      </div>
    );
  }
}

TextEditor.contextTypes = {
  formatters: PropTypes.object
};

export default TextEditor;
