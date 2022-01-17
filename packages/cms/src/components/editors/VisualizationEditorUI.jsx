import React, {Component} from "react";
import {connect} from "react-redux";
import {dataLoad} from "d3plus-viz";

import varSwapRecursive from "../../utils/varSwapRecursive";

import vizLookup from "./vizLookup";
import VizRow from "./components/VizRow";
import urlSwap from "../../utils/urlSwap";
import Select from "../fields/Select";
import TextInput from "../fields/TextInput";
import TextButtonGroup from "../fields/TextButtonGroup";
import Button from "../fields/Button";
import Alert from "../interface/Alert";

import "./VisualizationEditorUI.css";

class VisualizationEditorUI extends Component {

  constructor(props) {
    super(props);
    this.state = {
      object: {},
      rebuildAlertOpen: false,
      payload: [],
      payloadObject: {}
    };
  }

  componentDidMount() {
    const {simpleConfig} = this.props;
    // If a simple config has been provided, then the user has used simple mode in the past.
    // Populate the simple menu accordingly and make it the default mode.
    let object = {};
    // Bug: The deepclone used in VariableEditor erroneously logic_simple from NULL to {}
    // Therefore, detect the blank object as another expression of NULLness
    const configIsEmptyObject = simpleConfig && simpleConfig.constructor === Object && Object.keys(simpleConfig).length === 0;
    if (simpleConfig && !configIsEmptyObject) {
      object = Object.assign({}, simpleConfig);
      this.setState({object}, this.firstBuild.bind(this));
    }
    // If a simple config has not been provided, then the user has never used one before,
    // so prepare the interface with the default/first viz
    else {
      const defaultViz = vizLookup.find(v => v.default) || vizLookup[0];
      object = {
        type: defaultViz.type,
        data: [""]
      };
      // If this component is mounting and is NOT provided a simple config, it means the
      // user has just enabled simple mode. This means the parent component must be given
      // the simple logic NOW, so if the user clicks save without editing anything, it's there.
      this.setState({object}, this.compileCode.bind(this));
    }
  }

  extractPayload(resp) {
    if (resp) {
      if (!Array.isArray(resp)) {
        resp = [resp];
      }
      return resp.reduce((acc, d) => acc.concat(d.data), []);
    }
    else {
      return [];
    }
  }

  collateKeys(data) {
    return data.reduce((acc, d) => ({...acc, ...d}), {});
  }

  firstBuild() {
    const {object} = this.state;
    const {env} = this.props;
    const {previews, localeDefault} = this.props.status;
    // Stories can use Simplevizes, but don't have variables
    const variables = this.props.variables[localeDefault] || {};
    // An update to this component changed the default format for data and groupBy from string to array.
    // These typeof lines "upgrade" those legacy objects to the new format
    if (typeof object.data === "string") object.data = [object.data];
    if (typeof object.groupBy === "string") object.groupBy = [object.groupBy];
    const {data} = object;
    if (data && Array.isArray(data) && data[0]) {
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

      const {localeDefault, query} = this.props.status;
      const {formatterFunctions} = this.props.resources;
      const allSelectors = this.props.selectors;
      const formatters = formatterFunctions[localeDefault];

      const urls = data
        .map(url => urlSwap(url, Object.assign({}, env, variables, lookup)))
        .map(url => varSwapRecursive({url, allSelectors}, formatters, variables, query).url);

      dataLoad.bind({})(urls, this.extractPayload.bind(this), undefined, (error, payload) => {
        if (error) {
          console.log("API error", error);
          this.setState({rebuildAlertOpen: false});
        }
        else {
          const payloadObject = this.collateKeys.bind(this)(payload);
          this.setState({payload, payloadObject}, this.compileCode.bind(this));
        }
      });
    }
  }

  compileCode() {

    const {object, payloadObject} = this.state;
    const {type} = object;
    const stripID = d => typeof d === "string" ? d.replace(/(^ID\s|\sID$)/g, "") : d;

    const keys = Object.keys(object)
      // Filter out any keys where the user has manually selected none
      .filter(d => object[d] !== "manual-none")
      // Filter out the formatters lookup key
      .filter(d => d !== "formatters");

    const thisViz = vizLookup.find(v => v.type === type);
    const methods = thisViz ? thisViz.methods : [];

    const configObject = {};

    /**
     * Stores a value inside of the configObject at the specified chained key string,
     * making sure not to overwrite any previously set nested Objects.
     * @param {*} str A period-separated string, representing chained key names.
     * @param {*} value The final value to be set in the object.
     * @private
     */
    const periodStringParse = (str, value) => {
      const levels = str.split(".");
      levels.reduce((o, p, i) => (o[p] = i === levels.length - 1 ? value : o[p] || {}, o[p]), configObject);
    };

    keys.forEach(key => {

      const formatter = object.formatters ? object.formatters[key] : null;

      /** The main logic of setting key/value pairs on configObject */
      if (key === "html") {
        const value = `variables["${object[key]}"]`;
        configObject.html = formatter ? `formatters.${formatter}(${value})` : value;
      }
      else {
        periodStringParse(key, object[key]);
      }

      /** Here lies additional foldins that add to the default behaviors */
      if (key === "groupBy") {
        const groupBy = configObject.groupBy;
        const labelKey = Object.keys(payloadObject).find(d => d === stripID(groupBy[groupBy.length - 1]));
        if (labelKey) {
          configObject.label = `d => ${formatter ? `String(formatters.${formatter}(d["${labelKey}"]))` : `String(d["${labelKey}"])`}`;
        }
      }

      if (key === "data" && configObject.data.length === 1) {
        configObject.data = configObject.data[0];
      }

    });

    keys.forEach(key => {

      const formatter = object.formatters ? object.formatters[key] : null;
      const method = methods.find(method => method.key === key);

      /** If the method specifies a separate formatter method, set that now. */
      if (method && method.formatter && formatter && !object[method.formatter]) {
        periodStringParse(method.formatter, `d => formatters.${formatter}(d)`);
      }

      /** If the method specifies a separate title method, and it's not being set. */
      let titleKeys = method && method.title ? method.title : [];
      if (!(titleKeys instanceof Array)) titleKeys = [titleKeys];
      titleKeys.forEach(titleKey => {
        if (!keys.includes(titleKey) || !object[titleKey].length) periodStringParse(titleKey, object[key]);
      });

    });

    // To build the tooltip, filter our methods to only the methods with tooltip: true
    // and ignote any groupBy keys which are already handled with the label.
    const tooltipKeys = methods
      .filter(method => method.tooltip && object[method.key] !== "manual-none")
      .filter(method => object.groupBy ? object[method.key] !== stripID(object.groupBy[object.groupBy.length - 1]) : true)
      .map(d => d.key);


    // Set the appropriate tbody label and function for all
    // keys in the tooltipKeys array.
    if (tooltipKeys.length) {
      periodStringParse("tooltipConfig.tbody", tooltipKeys.map(k => {
        const formatter = object.formatters ? object.formatters[k] : null;
        return [object[k], `d => ${formatter ? `formatters.${formatter}(d["${object[k]}"])` : `d["${object[k]}"]`}`];
      }));
    }

    const newLine = d => "\n".padEnd(d * 2 + 1, " ");
    const stringifyObject = (obj, depth = 0) => {

      // Arrays are Objects. Needed to determine if the wrapper
      // charactares should be square brackets or curly braces.
      const isArray = obj instanceof Array;

      return `${isArray ? "[" : "{"}${newLine(depth + 1)}${Object.keys(obj)
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          let str = isArray ? "" : `${key}: `;
          const val = obj[key];

          // recursive check for objects/arrays
          if (typeof val === "object") str += `${stringifyObject(val, depth + 1)}`;
          // detect fat arrow functions and don't wrap with quotation marks
          else if (typeof val === "string" && val.startsWith("d => ")) str += `${val}`;
          // set all empty strings to a false Boolean
          else if (typeof val === "string" && !val.length) str += "false";
          // swap out <x> patterns for variables if needed
          else if (typeof val === "string" && val.match(/<[^\&\=\/>]+>/g)) {
            str += `\`${val.replace(/(<[^\&\=\/>]+>)/g, v => `\$\{variables.${v.slice(1, -1)}\}`)}\``;
          }
          // coerce leftover values into strings
          else str += `"${val}"`;

          return str;
        }).join(`,${newLine(depth + 1)}`)}${newLine(depth)}${isArray ? "]" : "}"}`;
    };

    const code = `return ${stringifyObject(configObject)};`;
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

  onChange(field, e, index) {
    const {object} = this.state;
    // Index is only provided if we are updating an array that needs one (like a composite groupBy)
    // Remember that 0 is falsey - we have to check for undefined.
    if (index !== undefined) {
      object[field][index] = e.target.value;
    }
    else {
      object[field] = e.target.value;
    }
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
    const {object} = this.state;
    object[key] = object[key].concat(object[key][0]);
    this.setState({object}, this.compileCode.bind(this));
  }

  onKeyRemove(key, index) {
    const {object} = this.state;
    object[key].splice(index, 1);
    this.setState({object}, this.compileCode.bind(this));
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

  getOptionList(method, payloadObject) {
    const allFields = Object.keys(payloadObject);
    const isID = d => d.match(/(ID\s|\sID)/g, "");
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
        .filter(key => method.typeof ? typeof payloadObject[key] === method.typeof : true)
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
    const variables = this.props.variables[localeDefault] || {};
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

    if (data && Array.isArray(data) && data[0]) {

      const {localeDefault, query} = this.props.status;
      const {formatterFunctions} = this.props.resources;
      const allSelectors = this.props.selectors;
      const formatters = formatterFunctions[localeDefault];

      const urls = data
        .map(url => urlSwap(url, Object.assign({}, env, variables, lookup)))
        .map(url => varSwapRecursive({url, allSelectors}, formatters, variables, query).url);

      console.log(urls);
      dataLoad.bind({})(urls, this.extractPayload.bind(this), undefined, (error, payload) => {
        if (error) {
          console.log("API error", error);
          this.setState({rebuildAlertOpen: false});
        }
        else {
          const payloadObject = this.collateKeys.bind(this)(payload);
          if (thisViz) {
            if (newObject.type === "Table") {
              newObject.columns = Object.keys(payloadObject);
            }
            else {
              thisViz.methods.forEach(method => {
                if (!newObject[method.key]) {
                  if (method.format === "Input") {
                    newObject[method.key] = "";
                  }
                  else {
                    const optionList = this.getOptionList.bind(this)(method, payloadObject);
                    if (optionList && optionList[0]) {
                      newObject[method.key] = method.multiple ? [optionList[0].value] : optionList[0].value;
                    }
                  }
                }
              });
            }
          }
          this.setState({
            payload,
            payloadObject,
            object: newObject,
            rebuildAlertOpen: false
          }, this.compileCode.bind(this));
        }
      });
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
    const {object, rebuildAlertOpen, payload, payloadObject} = this.state;
    const {localeDefault} = this.props.status;
    const {formatterFunctions} = this.props.resources;
    const formatters = formatterFunctions[localeDefault];
    const formatterList = formatters ? Object.keys(formatters).sort((a, b) => a.localeCompare(b)) : [];

    const thisViz = vizLookup.find(v => v.type === object.type);

    const requiresPayload = !["Graphic", "HTML"].includes(object.type);

    // Stories can use Simplevizes, but don't have variables
    const variables = this.props.variables[localeDefault] || {};
    const varOptions = Object.keys(variables)
      .filter(key => !key.startsWith("_"))
      .sort((a, b) => a.localeCompare(b))
      .map(key => {
        const value = variables[key];
        const type = typeof value;
        const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
        return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
      });

    let buttonProps = {
      children: "Build",
      disabled: true,
      namespace: "cms"
    };
    if (object.data && Array.isArray(object.data) && object.data.every(d => d) && object.type) {
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
      { requiresPayload && object.data && Array.isArray(object.data) &&
        object.data.map((d, i) =>
          <TextButtonGroup
            key={`data-${i}`}
            namespace="cms"
            inputProps={{
              label: <React.Fragment>
                Data Endpoint
                {i === 0
                  ? <Button
                    className="cms-vizrow-button"
                    onClick={() => this.onKeyAdd.bind(this)("data")}
                    icon="plus"
                    iconOnly
                  >
                    Add Endpoint
                  </Button>
                  : <Button
                    className="cms-vizrow-button"
                    onClick={() => this.onKeyRemove.bind(this)("data", i)}
                    icon="minus"
                    iconOnly
                  >
                    Remove Endpoint
                  </Button>
                }
              </React.Fragment>,
              inline: true,
              namespace: "cms",
              value: object.data[i] || "",
              onChange: e => this.onChange.bind(this)("data", e, i)
            }}
            buttonProps={i === 0 ? buttonProps : false}
          />
        )
      }

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

        {(!requiresPayload || payload.length > 0) && object.type && thisViz && thisViz.methods.map(method =>
          <VizRow
            method={method}
            object={object}
            payloadObject={payloadObject}
            key={method.key}
            onChange={this.onChange.bind(this)}
            onCheck={this.onCheck.bind(this)}
            onChangeFormatter={this.onChangeFormatter.bind(this)}
            onKeyAdd={this.onKeyAdd.bind(this)}
            onKeyRemove={this.onKeyRemove.bind(this)}
            formatterList={formatterList}
            options={
              method.format === "Variable"
                ? varOptions
                : this.getOptionList.bind(this)(method, payloadObject).map(option =>
                  <option key={option.value} value={option.value}>{option.display}</option>)
            }
          />
        )}
      </div>
    </div>;
  }
}

const mapStateToProps = state => ({
  env: state.env,
  variables: state.cms.variables,
  status: state.cms.status,
  resources: state.cms.resources,
  selectors: state.cms.status.currentPid ? state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors : []
});

export default connect(mapStateToProps)(VisualizationEditorUI);
