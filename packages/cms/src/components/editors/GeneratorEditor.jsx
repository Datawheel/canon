import axios from "axios";
import React, {Component} from "react";
import AceWrapper from "./AceWrapper";
import SimpleGeneratorEditor from "./SimpleGeneratorEditor";
import SimpleVisualizationEditor from "./SimpleVisualizationEditor";
import {Switch, Alert, Intent} from "@blueprintjs/core";

import "./GeneratorEditor.css";

class GeneratorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      variables: [],
      payload: null,
      simple: false,
      alertObj: false
    };
  }

  componentDidMount() {
    const {data, variables} = this.props;
    // If simple has been used in the past, we MUST fetch the payload from the
    // API so that the results for the variables can be filled in.
    const maybePreview = () => data.simple ? this.previewPayload(true) : null;
    this.setState({data, variables}, maybePreview);
  }

  changeField(field, e) {
    const {data} = this.state;
    data[field] = e.target.value;
    this.setState({data});
  }

  handleEditor(field, t) {
    const {data} = this.state;
    data[field] = t;
    this.setState({data});
  }

  chooseVariable(e) {
    const {data} = this.state;
    data.allowed = e.target.value;
    this.setState({data});
  }

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

  previewPayload(forceSimple) {
    const {data} = this.state;
    const {api} = data;
    if (api) {
      axios.get(api).then(resp => {
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
        message: "Are you sure you want to switch to Advanced Mode? This will abandon your Simple Mode state.",
        confirm: "Yes, go to Advanced Mode"
      };  
    }
    else {
      alertObj = {
        callback: this.switchSimple.bind(this),
        message: "Are you sure you want to switch to Simple Mode? This will abandon your current Advanced Mode code.",
        confirm: "Yes, go to Simple Mode"
      };    
    }
    this.setState({alertObj});
  }

  switchSimple() {
    const {simple, data} = this.state;
    if (simple) {
      data.simple = false;
      this.setState({simple: false, alertObj: false, data});
    }
    else {
      this.previewPayload.bind(this)(true);
    }
  }

  onSimpleChange(code, simple) {
    const {data} = this.state;
    data.logic = code;
    data.logic_simple = simple;
    this.setState({data});
  }

  render() {

    const {data, variables, payload, simple, alertObj} = this.state;
    const {type} = this.props;

    const preMessage = {
      generator: <p className="pt-text-muted">You have access to the variable <strong>resp</strong>, which represents the response to the above API call.</p>,
      materializer: <p className="pt-text-muted">You have access to all variables previously created by generators</p>,
      profile_visualization: <p className="pt-text-muted">You have access to all variables previously created by generators and materializers.</p>,
      topic_visualization: <p className="pt-text-muted">You have access to all variables previously created by generators and materializers.</p>,
      formatter: <p className="pt-text-muted">You have access to the variable <code>n</code>, which represents the string to be formatted.</p>
    };

    const postMessage = {
      generator: <p className="pt-text-muted">Be sure to return an <strong>object</strong> with the variables you want stored as keys.</p>,
      materalizer: <p className="pt-text-muted">Be sure to return an <strong>object</strong> with the variables you want stored as keys.</p>,
      profile_visualization: <p className="pt-text-muted">Be sure to return a valid config object for a visualization</p>,
      topic_visualization: <p className="pt-text-muted">Be sure to return a valid config object for a visualization</p>,
      formatter: <p className="pt-text-muted">Be sure to return a <strong>string</strong> that represents your formatted content.</p>
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

    if (simple && !payload) return null;

    return (
      <div id="generator-editor">
        <Alert
          cancelButtonText="Cancel"
          confirmButtonText={alertObj.confirm}
          className="confirm-alert"
          iconName="pt-icon-warning-sign"
          intent={Intent.DANGER}
          isOpen={alertObj}
          onConfirm={alertObj.callback}
          onCancel={() => this.setState({alertObj: false})}
        >
          {alertObj.message}
        </Alert>
        { type === "generator" || type === "materializer" || type === "formatter"
          ? <label className="pt-label pt-inline">
            <span className="label-text">Name</span>
            <input className="pt-input" type="text" value={data.name} onChange={this.changeField.bind(this, "name")}/>
          </label>
          : null
        }
        { type === "generator"
          ? <label className="pt-label pt-inline">
            <span className="label-text">API</span>
            <input className="pt-input" type="text" value={data.api} onChange={this.changeField.bind(this, "api")}/>
            <button onClick={this.maybePreviewPayload.bind(this)}>{payload && !payload.error ? "Refetch Data" : "Fetch Data"}</button>
          </label>
          : null
        }
        { type === "generator" || type === "materializer" || type === "formatter"
          ? <label className="pt-label pt-inline">
            <span className="label-text">Description</span>
            <input className="pt-input" type="text" value={data.description} onChange={this.changeField.bind(this, "description")}/>
          </label>
          : null
        }
        { (type === "generator" || type.includes("_visualization")) && <Switch checked={simple} label="Simple Mode" onChange={this.maybeSwitchSimple.bind(this)} /> }
        <div id="generator-ace">
          { type === "profile_visualization" || type === "topic_visualization"
            ? <label className="pt-label pt-inline">
              <span className="label-text">Allowed</span>
              <div className="pt-select">
                <select value={ data.allowed || "always" } onChange={this.chooseVariable.bind(this)}>
                  {varOptions}
                </select>
              </div>
            </label> : null
          }
          <label className="pt-label">Callback {preMessage[type]}</label>
          {payload && <textarea rows="10" cols="50" style={{fontFamily: "monospace"}} value={JSON.stringify(payload, null, 2)} />}
          {simple 
            ? type === "generator" 
              ? payload 
                ? <SimpleGeneratorEditor payload={payload} simpleConfig={data.logic_simple} onSimpleChange={this.onSimpleChange.bind(this)}/> 
                : null
              : <SimpleVisualizationEditor simpleConfig={data.logic_simple} onSimpleChange={this.onSimpleChange.bind(this)}/>
            : <AceWrapper
              className="editor"
              variables={variables}
              ref={ comp => this.editor = comp }
              onChange={this.handleEditor.bind(this, "logic")}
              value={data.logic}
              {...this.props}
            />
          }
          {!simple && postMessage[type]}
        </div>
      </div>
    );
  }
}

export default GeneratorEditor;
