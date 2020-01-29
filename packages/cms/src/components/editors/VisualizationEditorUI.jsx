import axios from "axios";
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {dataFold} from "d3plus-viz";

import vizLookup from "./vizLookup";
import urlSwap from "../../utils/urlSwap";
import Select from "../fields/Select";
import Button from "../fields/Button";
import TextInput from "../fields/TextInput";
import TextButtonGroup from "../fields/TextButtonGroup";
import Alert from "../interface/Alert";

import "./VisualizationEditorUI.css";

class VisualizationEditorUI extends Component {

  constructor(props) {
    super(props);
    this.state = {
      object: {},
      rebuildAlertOpen: false,
      payload: []
    };
  }

  componentDidMount() {
    const {simpleConfig} = this.props;
    // If a simple config has been provided, then the user has used simple mode in the past.
    // Populate the simple menu accordingly and make it the default mode.
    let object = {};
    // Bug: The deepclone used in VariableEditor erroneously logic_simple from NULL to {}
    // Therefore, detect the blank object as another expression of NULLness
    const configIsEmptyObject = simpleConfig.constructor === Object && Object.keys(simpleConfig).length === 0;
    if (simpleConfig && !configIsEmptyObject) {
      object = Object.assign({}, simpleConfig);
      this.setState({object}, this.firstBuild.bind(this));
    }
    // If a simple config has not been provided, then the user has never used one before,
    // so prepare the interface with the default/first viz
    else {
      const defaultViz = vizLookup.find(v => v.default) || vizLookup[0];
      object = {
        type: defaultViz.type
      };
      // If this component is mounting and is NOT provided a simple config, it means the
      // user has just enabled simple mode. This means the parent component must be given
      // the simple logic NOW, so if the user clicks save without editing anything, it's there.
      this.setState({object}, this.compileCode.bind(this));
    }
  }

  extractPayload(resp) {
    const data = resp.data;
    if (data instanceof Array) {
      return data;
    }
    if (data && data.data && data.headers) {
      return dataFold(data);
    }
    else if (data && data.data && data.data instanceof Array) {
      return data.data;
    }
    else {
      return [];
    }
  }

  firstBuild() {
    const {object} = this.state;
    const {env} = this.props;
    const {previews, localeDefault} = this.props.status;
    // Stories can use Simplevizes, but don't have variables
    const variables = this.props.status.variables[localeDefault] ? this.props.status.variables[localeDefault] : {};
    const {data} = object;
    if (data) {
      // The API will have an <id> in it that needs to be replaced with the current preview.
      // Use urlSwap to swap ANY instances of variables between brackets (e.g. <varname>)
      // With its corresponding value.
      const lookup = {};
      if (previews) {
        previews.forEach((p, i) => {
          if (i === 0) {
            lookup.id = p.id;
          }
          lookup[`id${i + 1}`] = p.id;
        });
      }
      const url = urlSwap(data, Object.assign({}, env, variables, lookup));
      axios.get(url).then(resp => {
        const payload = this.extractPayload(resp);
        this.setState({payload}, this.compileCode.bind(this));
      }).catch(e => {
        console.log("API error", e);
      });
    }
  }

  compileCode() {
    const {object, payload} = this.state;
    const {type} = object;
    const firstObj = payload.length > 0 && payload[0] ? payload[0] : {};
    const stripID = d => typeof d === "string" ? d.replace(/(ID\s|\sID)/g, "") : d;

    const keys = Object.keys(object)
      // Filter out any keys where the user has manually selected none
      .filter(d => object[d] !== "manual-none")
      // Filter out the formatters lookup key
      .filter(d => d !== "formatters");

    const thisViz = vizLookup.find(v => v.type === type);
    let tooltipKeys = [];
    if (thisViz) {
      tooltipKeys = thisViz.methods
        // To build the tooltip, filter our methods to only the tooltip keys
        .filter(method => method.tooltip)
        // If this key is already handled by groupBy, remove it from showing in the tooltip
        .filter(method => object.groupBy ? object[method.key] !== stripID(object.groupBy) : true)
        .map(d => d.key);
    }

    // If the user has put instance variables between brackets (e.g. <id> or <var>)
    // Then we need to manually create a special template string out of what the user
    // has written. Remember that the "logic" is javascript that will be executed, so
    // if the user has written something like ?id=<id> then the resulting code
    // must be a template string like `/api?id=${variables.id}`
    const code =
    `return {${
      keys.map(k => {
        if (k === "data") {
          let fixedUrl = object[k];
          (object[k].match(/<[^\&\=\/>]+>/g) || []).forEach(v => {
            const strippedVar = v.replace("<", "").replace(">", "");
            fixedUrl = fixedUrl.replace(v, `\$\{variables.${strippedVar}\}`);
          });
          return `\n  "${k}": \`${fixedUrl}\``;
        }
        // If the user is setting groupBy, we need to implicitly set the label also.
        else if (k === "groupBy") {
          const label = Object.keys(firstObj).find(d => d === stripID(object[k]));
          if (label) {
            const formatter = object.formatters ? object.formatters[k] : null;
            return `\n  "${k}": "${object[k]}",  \n  "label": d => ${formatter ? `formatters.${formatter}(d["${label}"])` : `d["${label}"]`}`;
          }
          else {
            return `\n  "${k}": "${object[k]}"`;
          }
        }
        // If the key has a dot, this is an object that needs to be destructured/crawled down
        else if (k.includes(".")) {
          const levels = k.split(".");
          // If this is an axis config, implicitly apply a formatter if there is one.
          if (levels[0] === "xConfig" || levels[0] === "yConfig") {
            const formatter = object.formatters ? object.formatters[levels[0].charAt(0)] : null;
            // xyConfig titles, when empty strings, need to be false.
            const value = levels[1] === "title" ? object[k] === "" ? "false" : `"${object[k]}"` : `"${object[k]}"`;
            if (formatter) {
              return `\n  "${levels[0]}" : {"${levels[1]}": ${value}, "tickFormat": formatters.${formatter}}`;
            }
            else {
              return `\n  "${levels[0]}" : {"${levels[1]}": ${value}}`;
            }
          }
          else {
            return `\n  "${levels[0]}" : {"${levels[1]}": "${object[k]}"}`;
          }
        }
        else if (k === "columns") {
          return `\n  "${k}": ${JSON.stringify(object[k])}`;
        }
        else {
          return `\n  "${k}": "${object[k]}"`;
        }
      })
    },${`
  "tooltipConfig": {
    "tbody": [
      ${tooltipKeys.map(k => {
    const formatter = object.formatters ? object.formatters[k] : null;
    return `["${object[k]}", d => ${formatter ? `formatters.${formatter}(d["${object[k]}"])` : `d["${object[k]}"]`}]`;
  })}
    ]
  }`}\n}`;
    if (this.props.onSimpleChange) this.props.onSimpleChange(code, object);
  }

  maybeRebuild() {
    const {payload} = this.state;
    if (payload.length > 0) {
      this.setState({rebuildAlertOpen: true});
    }
    else {
      this.rebuild.bind(this)();
    }
  }

  onChange(field, e) {
    const {object} = this.state;
    object[field] = e.target.value;
    // If the user is changing the type, we need to clear and rebuild the object from scratch using a fresh payload.
    if (field === "type") {
      this.setState({object}, this.rebuild.bind(this));
    }
    // If the user is changing an x or y field, implicitly reset the label for the axis.
    else if (field === "x" || field === "y") {
      object[`${field}Config.title`] = e.target.value;
      this.setState({object}, this.compileCode.bind(this));
    }
    // Otherwise they are just changing a drop-down field
    else {
      this.setState({object}, this.compileCode.bind(this));
    }
  }

  onKeyAdd(key) {
    const {object, payload} = this.state;
    // const firstObj = payload.length > 0 && payload[0] ? payload[0] : {};
    if (typeof object[key] === "string") {
      object[key] = [object[key], object[key]];
    }
    else if (Array.isArray(object[key])) {
      object[key] = object[key].concat(object[key]);
    }
    this.setState({object});
  }

  onKeyRemove(key) {
    const {object} = this.state;
    if (Array.isArray(object[key])) object[key].splice(1, -1);
    this.setState({object});
  }

  onChangeFormatter(field, e) {
    const {object} = this.state;
    if (!object.formatters) object.formatters = {};
    if (e.target.value === "manual-none") {
      delete object.formatters[field];
    }
    else {
      object.formatters[field] = e.target.value;
    }
    this.setState({object}, this.compileCode.bind(this));
  }

  getOptionList(method, payload) {
    const firstObj = payload.length > 0 && payload[0] ? payload[0] : {};
    const isID = d => d.match(/(ID\s|\sID)/g, "");
    const allFields = Object.keys(firstObj);
    const plainFields = allFields.filter(d => !isID(d));
    const idFields = allFields.filter(d => isID(d));
    let options = [];
    if (!method.required) options.push({value: "manual-none", display: "None"});
    if (method.typeof === "id") {
      options = options.concat(plainFields.map(key => {
        const idField = idFields.find(d => d.includes(key));
        return {value: idField ? idField : key, display: key};
      }));
    }
    else {
      options = options.concat(allFields
        .filter(key => method.typeof ? typeof firstObj[key] === method.typeof : true)
        .map(key => ({value: key, display: key})));
    }
    return options;
  }

  onCheck(field) {
    const {object} = this.state;

    // if it's there, remove it
    if (object.columns.find(col => col === field))  {
      object.columns = object.columns.filter(col => col !== field);
    }
    else object.columns.push(field);

    this.setState({object}, this.compileCode.bind(this));
  }

  rebuild() {
    const {object} = this.state;
    const {env} = this.props;
    const {previews, localeDefault} = this.props.status;
    // Stories can use Simplevizes, but don't have variables
    const variables = this.props.status.variables[localeDefault] ? this.props.status.variables[localeDefault] : {};
    const {data, type} = object;
    const thisViz = vizLookup.find(v => v.type === type);
    const lookup = {};
    if (previews) {
      previews.forEach((p, i) => {
        if (i === 0) {
          lookup.id = p.id;
        }
        lookup[`id${i + 1}`] = p.id;
      });
    }

    const newObject = {
      data: object.data,
      type: object.type
    };

    if (thisViz) {
      // Copy over any relevant keys from the previous config
      thisViz.methods.forEach(method => {
        if (object[method.key]) {
          newObject[method.key] = object[method.key];
        }
      });
      if (object.title) newObject.title = object.title;
    }

    if (data) {

      const url = urlSwap(data, Object.assign({}, env, variables, lookup));
      axios.get(url)
        .then(resp => {
          const payload = this.extractPayload(resp);
          const firstObj = payload.length > 0 && payload[0] ? payload[0] : {};
          if (thisViz && firstObj) {
            if (newObject.type === "Table") {
              newObject.columns = Object.keys(firstObj);
            }
            else {
              thisViz.methods.forEach(method => {
                if (!newObject[method.key]) {
                  if (method.format === "Input") {
                    newObject[method.key] = "";
                  }
                  else {
                    const optionList = this.getOptionList.bind(this)(method, payload);
                    if (optionList && optionList[0]) {
                      newObject[method.key] = optionList[0].value;
                    }
                  }
                }
              });
            }
          }
          this.setState({
            payload,
            object: newObject,
            rebuildAlertOpen: false
          }, this.compileCode.bind(this));
        })
        .catch(e => console.log("API error", e));
    }
    else {
      this.setState({
        object: newObject,
        rebuildAlertOpen: false
      });
    }
  }

  render() {
    const {modeSwitcher} = this.props;
    const {object, rebuildAlertOpen, payload} = this.state;
    const {localeDefault} = this.props.status;
    const {formatterFunctions} = this.props.resources;
    const formatters = formatterFunctions[localeDefault];
    const formatterList = formatters ? Object.keys(formatters).sort((a, b) => a.localeCompare(b)) : [];
    const selectedColumns = object.columns || [];
    const firstObj = payload.length > 0 && payload[0] ? payload[0] : {};

    const thisViz = vizLookup.find(v => v.type === object.type);
    const allFields = Object.keys(firstObj);

    let buttonProps = {
      children: "Build",
      disabled: true,
      namespace: "cms"
    };
    if (object.data && object.type) {
      buttonProps = {
        children: payload.length > 0 ? "Rebuild" : "Build",
        namespace: "cms",
        onClick: this.maybeRebuild.bind(this)
      };
    }

    return <div className="cms-viz-editor">
      <Alert
        title="Rebuild visualization using new data URL?"
        cancelButtonText="Cancel"
        confirmButtonText="Rebuild"
        className="confirm-alert"
        isOpen={rebuildAlertOpen}
        onConfirm={this.rebuild.bind(this)}
        onCancel={() => this.setState({rebuildAlertOpen: false})}
      />

      {/* data URL */}
      <TextButtonGroup
        namespace="cms"
        inputProps={{
          label: "Data endpoint",
          inline: true,
          namespace: "cms",
          value: object.data || "",
          onChange: this.onChange.bind(this, "data")
        }}
        buttonProps={buttonProps}
      />

      <div className="cms-field-group u-margin-bottom-off">
        <Select
          label="Visualization"
          inline
          namespace="cms"
          value={object.type}
          onChange={this.onChange.bind(this, "type")}
        >
          <option value="undefined" default>Select visualization type</option>
          {vizLookup.map(viz =>
            <option key={viz.type} value={viz.type}>{viz.name}</option>
          )}
        </Select>
        <TextInput
          label="Title"
          namespace="cms"
          inline
          key="title-text"
          value={object.title}
          onChange={this.onChange.bind(this, "title")}
        />
      </div>

      {/* mode switcher & additional viz options */}
      <div className="viz-select-group u-margin-top-xs">

        {modeSwitcher}

        {payload.length > 0 && object.type && thisViz && thisViz.methods.map(method =>
          // render prop as text input
          method.format === "Input"
            ? <TextInput
              label={method.display}
              namespace="cms"
              fontSize="xs"
              inline
              key={method.key}
              value={object[method.key]}
              onChange={this.onChange.bind(this, method.key)}
            />

            // render payload as checkboxes
            : method.format === "Checkbox"
              ? <fieldset className="cms-fieldset">
                <legend className="u-font-sm">Columns</legend>
                {allFields.map(column =>
                  <label className="cms-checkbox-label u-font-xs" key={column}>
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column)}
                      onChange={() => this.onCheck(column)}
                    /> {column}
                  </label>
                )}
              </fieldset>

              // render method.key as select
              : <Fragment>
                <Select
                  key="cms-key-select"
                  label={method.display}
                  namespace="cms"
                  fontSize="xs"
                  value={object[method.key]}
                  onChange={this.onChange.bind(this, method.key)}
                  inline
                >
                  {this.getOptionList.bind(this)(method, payload).map(option =>
                    <option key={option.value} value={option.value}>{option.display}</option>
                  )}
                </Select>
                <Select
                  key="cms-formatter-select"
                  label={`${method.display} formatter`}
                  labelHidden
                  namespace="cms"
                  fontSize="xs"
                  value={object.formatters ? object.formatters[method.key] : "manual-none"}
                  onChange={this.onChangeFormatter.bind(this, method.key)}
                  inline
                >
                  <option key={null} value="manual-none">No formatter</option>
                  {formatterList.map(f => <option key={f} value={f}>{f}</option>)}
                </Select>
              </Fragment>
        )}
      </div>
    </div>;
  }
}

const mapStateToProps = state => ({
  env: state.env,
  status: state.cms.status,
  resources: state.cms.resources
});

export default connect(mapStateToProps)(VisualizationEditorUI);
