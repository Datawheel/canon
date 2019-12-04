import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import AceWrapper from "./AceWrapper";
import SimpleGeneratorEditor from "./SimpleGeneratorEditor";
import SimpleVisualizationEditor from "./SimpleVisualizationEditor";
import {Switch, Alert, Intent} from "@blueprintjs/core";
import urlSwap from "../../utils/urlSwap";
import Select from "../fields/Select";
import TextInput from "../fields/TextInput";
import TextButtonGroup from "../fields/TextButtonGroup";
import AllowedSelector from "../interface/AllowedSelector";

import "./GeneratorEditor.css";

class GeneratorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      payload: null,
      simple: false,
      alertObj: false,
      isDirty: false
    };
  }

  componentDidMount() {
    const {data, type} = this.props;
    // If simple has been used in the past and this is a generator, we MUST fetch the payload from the
    // API so that the results for the variables can be filled in.
    if (type === "generator") {
      const maybePreview = () => data.simple ? this.previewPayload(true) : null;
      this.setState({data}, maybePreview);
    }
    // If simple has been used in the past as a visualization, we need only switch to simple mode without payload.
    else if (type.includes("_visualization")) {
      const {simple} = data;
      this.setState({data, simple});
    }
    else {
      this.setState({data});
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
    const {attr, env} = this.props;
    const {previews, localeDefault} = this.props.status;
    // Stories can use GeneratorEditors, but don't have variables
    const variables = this.props.status.variables[localeDefault] ? this.props.status.variables[localeDefault] : {};
    if (api) {
      // The API will have <ids> in it that needs to be replaced with the current preview.
      // Use urlSwap to swap ANY instances of variables between brackets (e.g. <varname>)
      // With its corresponding value. Same goes for locale
      const lookup = {locale: localeDefault};
      previews.forEach((p, i) => {
        if (i === 0) {
          lookup.id = p.id;
        }
        lookup[`id${i + 1}`] = p.id;
      });
      const url = urlSwap(api, Object.assign({}, attr, env, variables, lookup));
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

    const {data, payload, simple, alertObj} = this.state;
    const {type} = this.props;
    const {localeDefault} = this.props.status;
    
    // Stories can use GeneratorEditors, but don't have variables
    const variables = this.props.status.variables[localeDefault] ? this.props.status.variables[localeDefault] : {};

    const preMessage = {
      generator: <React.Fragment>You have access to the variable <strong>resp</strong>, which represents the response to the above API call.</React.Fragment>,
      materializer: <React.Fragment>You have access to all variables previously created by generators</React.Fragment>,
      profile_visualization: <React.Fragment>You have access to all variables previously created by generators and materializers.</React.Fragment>,
      section_visualization: <React.Fragment>You have access to all variables previously created by generators and materializers.</React.Fragment>,
      formatter: <React.Fragment>You have access to the variable <code>n</code>, which represents the string to be formatted.</React.Fragment>
    };

    const postMessage = {
      generator: <React.Fragment>Be sure to return an <strong>object</strong> with the variables you want stored as keys.</React.Fragment>,
      materalizer: <React.Fragment>Be sure to return an <strong>object</strong> with the variables you want stored as keys.</React.Fragment>,
      profile_visualization: <React.Fragment>Be sure to return a valid config object for a visualization</React.Fragment>,
      section_visualization: <React.Fragment>Be sure to return a valid config object for a visualization</React.Fragment>,
      formatter: <React.Fragment>Be sure to return a <strong>string</strong> that represents your formatted content.</React.Fragment>
    };

    if (!data) return null;

    return (
      <div className="generator-editor">
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
            <TextInput
              label="Name"
              namespace="cms"
              inline
              value={data.name}
              onChange={this.changeField.bind(this, "name")}
            />
            <TextInput
              label="Description"
              namespace="cms"
              inline
              value={data.description}
              onChange={this.changeField.bind(this, "description")}
            />
          </div>
        }

        { type === "generator" &&
          <TextButtonGroup
            namespace="cms"
            inputProps={{
              label: "API",
              inline: true,
              namespace: "cms",
              value: data.api,
              onChange: this.changeField.bind(this, "api")
            }}
            buttonProps={{
              children: payload && !payload.error ? "Refetch data" : "Fetch data",
              namespace: "cms",
              icon: payload && !payload.error ? "refresh" : "download",
              onClick: this.maybePreviewPayload.bind(this)
            }}
          />
        }
        {/* callback instructions */}
        {!simple &&
          <section className="generator-editor-help">
            <h3 className="u-font-sm">Callback</h3>
            <p className="u-font-xs">{preMessage[type]}</p>
            <p className="u-font-xs">{postMessage[type]}</p>
          </section>
        }

        <div className={`cms-variable-editor-group${!payload ? " single-column u-margin-bottom-xs" : ""}`}>
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
              : <SimpleVisualizationEditor key="simp-viz" simpleConfig={data.logic_simple} onSimpleChange={this.onSimpleChange.bind(this)}/>
            : <AceWrapper
              key="ace-wrap"
              className="editor"
              ref={ comp => this.editor = comp }
              onChange={this.handleEditor.bind(this, "logic")}
              value={data.logic}
              {...this.props}
            />
          }
        </div>

        {/* visibility */}
        { type === "section_visualization" &&
          <AllowedSelector
            variables={variables}
            value={data.allowed !== undefined ? data.allowed : "always"}
            onChange={this.chooseVariable.bind(this)}
          />
        }

        {/* UI/JS mode toggle */}
        { (type === "generator" || type.includes("_visualization")) &&
          <div className="cms-field-container cms-mode-switch-container">
            <Switch checked={simple} label="UI mode" onChange={this.maybeSwitchSimple.bind(this)} />
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  env: state.env,
  status: state.cms.status
});

export default connect(mapStateToProps)(GeneratorEditor);
