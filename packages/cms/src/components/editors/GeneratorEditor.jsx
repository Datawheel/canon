import axios from "axios";
import React, {Component} from "react";
import AceWrapper from "./AceWrapper";
import SimpleGeneratorEditor from "./SimpleGeneratorEditor";
import SimpleVisualizationEditor from "./SimpleVisualizationEditor";
import {Switch, Alert, Intent} from "@blueprintjs/core";
import urlSwap from "../../utils/urlSwap";

import "./GeneratorEditor.css";

class GeneratorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      variables: [],
      payload: null,
      simple: false,
      alertObj: false,
      isDirty: false
    };
  }

  componentDidMount() {
    const {data, variables, type} = this.props;
    // If simple has been used in the past and this is a generator, we MUST fetch the payload from the
    // API so that the results for the variables can be filled in.
    if (type === "generator") {
      const maybePreview = () => data.simple ? this.previewPayload(true) : null;
      this.setState({data, variables}, maybePreview);
    }
    // If simple has been used in the past as a visualization, we need only switch to simple mode without payload.
    else if (type.includes("_visualization")) {
      const {simple} = data;
      this.setState({data, variables, simple});
    }
    else {
      this.setState({data, variables});
    }
  }

  changeField(field, e) {
    const {isDirty, data} = this.state;
    data[field] = e.target.value;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  handleEditor(field, t) {
    const {isDirty, data} = this.state;
    data[field] = t;
    if (!isDirty) {
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

  /**
   * Called by the "Refetch Data" button. Make sure the user knows that a new fetch will change the payload.
   */
  maybePreviewPayload() {
    const {payload} = this.state;
    // Only prompt the user if there is already a payload (therefore they are overriding/changing it)
    if (payload && !payload.error) {
      const alertObj = {
        callback: this.previewPayload.bind(this),
        message: "Are you sure you want to reload the API results? This will not change your current code, but it may cause some objects to become undefined.",
        confirm: "Yes, reload the API results"
      };
      this.setState({alertObj});
    }
    // If there is no payload or it was an error, they are fetching for the first time, so just grab it.
    else {
      this.previewPayload.bind(this)();
    }
  }

  /**
   * Hits the API and sets the resulting payload in state. Note that this can be called either by pressing the Fetch Data
   * button OR when the user switches to simple mode. When pressing fetch data, we need only hit the API again. However,
   * if the user is switching to simple, then once the API returns, handle switching the UI to simple mode (forceEZ).
   */
  previewPayload(forceSimple) {
    const {data} = this.state;
    const {api} = data;
    const {preview, variables, locale} = this.props;
    if (api) {
      // The API will have an <id> in it that needs to be replaced with the current preview.
      // Use urlSwap to swap ANY instances of variables between brackets (e.g. <varname>)
      // With its corresponding value. Same goes for locale
      const url = urlSwap(api, Object.assign({}, variables, {id: preview, locale}));
      axios.get(url).then(resp => {
        const payload = resp.data;
        let {simple} = this.state;
        // This comparison is important! forceSimple must be EXACTLY true to indicate we are overriding it. Otherwise it's a
        // proxy event from a click, which indeed is truthy, but not a pure argument override.
        if (forceSimple === true) {
          simple = true;
          data.simple = true;
        }
        this.setState({payload, simple, data, alertObj: false});
      }).catch(() => {
        const payload = {error: "Please enter a valid API URL."};
        let {simple} = this.state;
        // This comparison is important! forceSimple must be EXACTLY true to indicate we are overriding it. Otherwise it's a
        // proxy event from a click, which indeed is truthy, but not a pure argument override.
        if (forceSimple === true) {
          simple = true;
          data.simple = true;
        }
        this.setState({payload, simple, data, alertObj: false});
      });
    }
    else {
      const payload = {error: "Please enter a valid API URL."};
      let {simple} = this.state;
      // This comparison is important! forceSimple must be EXACTLY true to indicate we are overriding it. Otherwise it's a
      // proxy event from a click, which indeed is truthy, but not a pure argument override.
      if (forceSimple === true) {
        simple = true;
        data.simple = true;
      }
      this.setState({payload, simple, data, alertObj: false});
    }
  }

  maybeSwitchSimple() {
    const {simple} = this.state;
    let alertObj = false;
    if (simple) {
      alertObj = {
        callback: this.switchSimple.bind(this),
        message: "Are you sure you want to switch to JS mode? This will abandon your UI mode state.",
        confirm: "JS mode"
      };
    }
    else {
      alertObj = {
        callback: this.switchSimple.bind(this),
        message: "Are you sure you want to switch to UI mode? This will abandon your current JS code.",
        confirm: "UI mode"
      };
    }
    this.setState({alertObj});
  }

  switchSimple() {
    const {simple, data} = this.state;
    const {type} = this.props;
    if (simple) {
      data.simple = false;
      this.setState({simple: false, alertObj: false, data});
    }
    // If we are enabling simple mode
    else {
      // If it's a generator, then we need a payload before we can switch over.
      if (type === "generator") {
        this.previewPayload.bind(this)(true);
      }
      // However it's a visualization, no payload is needed. Enable simple mode and switch without an API call.
      else if (type.includes("_visualization")) {
        data.simple = true;
        this.setState({simple: true, data, alertObj: false});
      }
    }
  }

  onSimpleChange(code, simple) {
    const {isDirty, data} = this.state;
    data.logic = code;
    data.logic_simple = simple;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  render() {

    const {data, variables, payload, simple, alertObj} = this.state;
    const {type, preview} = this.props;

    const preMessage = {
      generator: <p className="bp3-text-muted">You have access to the variable <strong>resp</strong>, which represents the response to the above API call.</p>,
      materializer: <p className="bp3-text-muted">You have access to all variables previously created by generators</p>,
      profile_visualization: <p className="bp3-text-muted">You have access to all variables previously created by generators and materializers.</p>,
      topic_visualization: <p className="bp3-text-muted">You have access to all variables previously created by generators and materializers.</p>,
      formatter: <p className="bp3-text-muted">You have access to the variable <code>n</code>, which represents the string to be formatted.</p>
    };

    const postMessage = {
      generator: <p className="bp3-text-muted">Be sure to return an <strong>object</strong> with the variables you want stored as keys.</p>,
      materalizer: <p className="bp3-text-muted">Be sure to return an <strong>object</strong> with the variables you want stored as keys.</p>,
      profile_visualization: <p className="bp3-text-muted">Be sure to return a valid config object for a visualization</p>,
      topic_visualization: <p className="bp3-text-muted">Be sure to return a valid config object for a visualization</p>,
      formatter: <p className="bp3-text-muted">Be sure to return a <strong>string</strong> that represents your formatted content.</p>
    };

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

    if (!data) return null;

    return (
      <div id="generator-editor">
        <Alert
          cancelButtonText="Cancel"
          confirmButtonText={alertObj.confirm}
          className="cms-confirm-alert"
          iconName="bp3-icon-warning-sign"
          intent={Intent.DANGER}
          isOpen={alertObj}
          onConfirm={alertObj.callback}
          onCancel={() => this.setState({alertObj: false})}
        >
          {alertObj.message}
        </Alert>

        {/* name & description fields */}
        {(type === "generator" || type === "materializer" || type === "formatter") &&
          <div className="cms-field-group">
            <div key="gen-name" className="cms-field-container">
              <label className="label">Name</label>
              <input className="bp3-input" type="text" value={data.name} onChange={this.changeField.bind(this, "name")}/>
            </div>
            <div key="gen-desc" className="cms-field-container">
              <label className="label">Description</label>
              <input className="bp3-input" type="text" value={data.description} onChange={this.changeField.bind(this, "description")}/>
            </div>
          </div>
        }

        { type === "generator" &&
          <div className="cms-field-container">
            <label className="label" htmlFor="api">API</label>
            <div className="cms-field-container-inline bp3-input-group">
              <input className="bp3-input" type="text" value={data.api} onChange={this.changeField.bind(this, "api")} id="api"/>
              <button className="cms-button bp3-button" onClick={this.maybePreviewPayload.bind(this)}>
                {payload && !payload.error ? "Refetch data" : "Fetch data"}
              </button>
            </div>
          </div>
        }
        { (type === "generator" || type.includes("_visualization")) &&
          <div className="cms-field-container">
            <Switch checked={simple} label="UI mode" onChange={this.maybeSwitchSimple.bind(this)} />
          </div>
        }
        {/* visibility */}
        <div className="cms-field-container">
          { (type === "profile_visualization" || type === "topic_visualization") &&
            <label className="bp3-label bp3-inline">
              <span className="label-text">Allowed</span>
              <div className="bp3-select">
                <select value={ data.allowed || "always" } onChange={this.chooseVariable.bind(this)}>
                  {varOptions}
                </select>
              </div>
            </label>
          }
        </div>
        {/* callback instructions */}
        {!simple &&
          <div className="cms-paragraphs">
            Callback
            {preMessage[type]}
            {postMessage[type]}
          </div>
        }

        <div className={`cms-variable-editor-group${!payload ? " single-column" : ""}`}>
          {/* json */}
          {payload &&
            <pre className="cms-variable-editor-json">
              <code className="cms-variable-editor-json-inner">{JSON.stringify(payload, null, 2)}</code>
            </pre>
          }
          {simple
            ? type === "generator"
              ? payload
                ? <SimpleGeneratorEditor
                  key="simp-gen"
                  payload={payload}
                  simpleConfig={data.logic_simple} 
                  onSimpleChange={this.onSimpleChange.bind(this)}
                />
                : null
              : <SimpleVisualizationEditor key="simp-viz" preview={preview} variables={variables} simpleConfig={data.logic_simple} onSimpleChange={this.onSimpleChange.bind(this)}/>
            : <AceWrapper
              key="ace-wrap"
              className="editor"
              variables={variables}
              ref={ comp => this.editor = comp }
              onChange={this.handleEditor.bind(this, "logic")}
              value={data.logic}
              {...this.props}
            />
          }
        </div>
      </div>
    );
  }
}

export default GeneratorEditor;
