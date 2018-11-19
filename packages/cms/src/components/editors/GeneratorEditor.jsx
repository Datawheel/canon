import axios from "axios";
import React, {Component} from "react";
import AceWrapper from "./AceWrapper";
import JSEditor from "./JSEditor";
import {Switch, Alert, Intent} from "@blueprintjs/core";

import "./GeneratorEditor.css";

class GeneratorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      variables: [],
      payload: null,
      ezmode: false,
      alertObj: false
    };
  }

  componentDidMount() {
    const {data, variables} = this.props;
    // If ezmode has been used in the past, we MUST fetch the payload from the
    // API so that the results for the variables can be filled in.
    const maybePreview = () => data.ez ? this.previewPayload(true) : null;
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
    const alertObj = {
      callback: this.previewPayload.bind(this),
      message: "Are you sure you want to reload the API results? This will not change your current code, but it may cause some objects to become undefined!",
      confirm: "Yes, reload the API results"
    };
    this.setState({alertObj});
  }

  previewPayload(forceEZ) {
    const {api} = this.state.data;
    axios.get(api).then(resp => {
      const payload = resp.data;
      const ezmode = forceEZ === true ? true : this.state.ezmode;
      this.setState({payload, ezmode, alertObj: false});
    });
  }

  maybeSwitchEZ() {
    const {ezmode} = this.state;
    let alertObj = false;
    if (ezmode) {
      alertObj = {
        callback: this.switchEZ.bind(this),
        message: "Are you sure you want to switch to Advanced Mode? This will abandon your EZ Mode state!",
        confirm: "Yes, go to Advanced Mode"
      };  
    }
    else {
      alertObj = {
        callback: this.switchEZ.bind(this),
        message: "Are you sure you want to switch to EZ Mode? This will abandon your current Advanced Mode code!",
        confirm: "Yes, go to EZ Mode"
      };    
    }
    this.setState({alertObj});
  }

  switchEZ() {
    const {ezmode, data} = this.state;
    if (ezmode) {
      data.ez = null;
      this.setState({ezmode: false, alertObj: false, data});
    }
    else {
      this.previewPayload.bind(this)(true);
    }
  }

  onEZChange(code, ez) {
    const {data} = this.state;
    data.logic = code;
    data.ez = ez;
    this.setState({data});
  }

  render() {

    const {data, variables, payload, ezmode, alertObj} = this.state;
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

    if (ezmode && !payload) return null;

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
            <button onClick={this.maybePreviewPayload.bind(this)}>{payload ? "Refetch Data" : "Fetch Data"}</button>
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
        <Switch checked={ezmode} label="EZ Mode" onChange={this.maybeSwitchEZ.bind(this)} />
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
          {ezmode 
            ? payload 
              ? <JSEditor payload={payload} ez={data.ez} onEZChange={this.onEZChange.bind(this)}/> 
              : null
            : <AceWrapper
              className="editor"
              variables={variables}
              ref={ comp => this.editor = comp }
              onChange={this.handleEditor.bind(this, "logic")}
              value={data.logic}
              {...this.props}
            />
          }
          {!ezmode && postMessage[type]}
        </div>
      </div>
    );
  }
}

export default GeneratorEditor;
