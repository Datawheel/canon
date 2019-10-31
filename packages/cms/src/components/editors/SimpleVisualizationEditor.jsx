import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {Alert, Intent} from "@blueprintjs/core";
import urlSwap from "../../utils/urlSwap";
import Select from "../fields/Select";
import TextInput from "../fields/TextInput";
import TextButtonGroup from "../fields/TextButtonGroup";

import "./SimpleVisualizationEditor.css";

const vizLookup = {
  AreaPlot: ["groupBy", "x", "y"],
  BarChart: ["groupBy", "x", "y"],
  BumpChart: ["groupBy", "x", "y"],
  Donut: ["groupBy", "value"],
  Geomap: ["groupBy", "colorScale", "topojson"],
  Graphic: ["label", "value", "subtitle", "imageURL"],
  LinePlot: ["groupBy", "x", "y"],
  PercentageBar: ["groupBy", "value"],
  Pie: ["groupBy", "value"],
  StackedArea: ["groupBy", "x", "y"],
  Treemap: ["groupBy", "sum"],
  Table: ["columns"]
};

const textFields = ["imageURL", "topojson"];
const checkboxFields = ["columns"];

class SimpleVisualizationEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      object: {},
      rebuildAlertOpen: false,
      payload: {}
    };
  }

  componentDidMount() {
    const {simpleConfig} = this.props;
    // If a simple config has been provided, then the user has used simple mode in the past.
    // Populate the simple menu accordingly and make it the default mode.
    let object = {};
    if (simpleConfig) {
      object = Object.assign({}, simpleConfig);
      this.setState({object}, this.firstBuild.bind(this));
    }
    // If a simple config has not been provided, then the user has never used one before,
    // so prepare the interface with a the first viz
    else {
      object = {
        type: Object.keys(vizLookup)[0]
      };
      // If this component is mounting and is NOT provided a simple config, it means the
      // user has just enabled simple mode. This means the parent component must be given
      // the simple logic NOW, so if the user clicks save without editing anything, it's there.
      this.setState({object}, this.compileCode.bind(this));
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
        const payload = resp.data;

        this.setState({payload}, this.compileCode.bind(this));
      }).catch(e => {
        console.log("API error", e);
      });
    }
  }

  compileCode() {
    const {object} = this.state;
    // If the user has put instances variables between brackets (e.g. <id> or <var>)
    // Then we need to manually create a special template string out of what the user
    // has written. Remember that the "logic" is javascript that will be executed, so
    // if the user has written something like ?id=<id> then the resulting code
    // must be a template string like `/api?id=${variables.id}`
    const code =
    `return {${
      Object.keys(object).map(k => {
        if (k === "data") {
          let fixedUrl = object[k];
          (object[k].match(/<[^\&\=\/>]+>/g) || []).forEach(v => {
            const strippedVar = v.replace("<", "").replace(">", "");
            fixedUrl = fixedUrl.replace(v, `\$\{variables.${strippedVar}\}`);
          });
          return `\n  "${k}": \`${fixedUrl}\``;
        }
        else {
          if (k === "columns") {
            return `\n "${k}": ${JSON.stringify(object[k])}`;
          }
          else {
            return `\n  "${k}": "${object[k]}"`;
          }
        }
      })
    }\n}`;
    if (this.props.onSimpleChange) this.props.onSimpleChange(code, object);
  }

  maybeRebuild() {
    const {payload} = this.state;
    if (payload.data) {
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
    // Otherwise they are just changing a drop-down field and we need only recompile the code above.
    else {
      this.setState({object}, this.compileCode.bind(this));
    }
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

    if (data) {

      const url = urlSwap(data, Object.assign({}, env, variables, lookup));
      axios.get(url)
        .then(resp => {
          const payload = resp.data;
          const firstObj = payload.data[0];
          if (vizLookup[type] && firstObj) {
            if (newObject.type === "Table") {
              newObject.columns = Object.keys(firstObj);
            }
            else {
              vizLookup[type].forEach(f => newObject[f] = Object.keys(firstObj)[0]);
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
    const {object, rebuildAlertOpen, payload} = this.state;
    const selectedColumns = object.columns || [];
    const firstObj = payload && payload.data && payload.data[0] ? payload.data[0] : object;

    let buttonProps = {
      children: "Build",
      disabled: true,
      namespace: "cms"
    };
    if (object.data) {
      buttonProps = {
        children: payload.data ? "Rebuild" : "Build",
        namespace: "cms",
        onClick: this.maybeRebuild.bind(this)
      };
    }

    return <div className="cms-viz-editor">
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Rebuild"
        className="confirm-alert"
        iconName="bp3-icon-warning-sign"
        intent={Intent.DANGER}
        isOpen={rebuildAlertOpen}
        onConfirm={this.rebuild.bind(this)}
        onCancel={() => this.setState({rebuildAlertOpen: false})}
      >
        Are you sure you want to rebuild this visualization using a new data URL?
      </Alert>

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

      <div className="cms-field-group">
        <Select
          label="Visualization"
          inline
          namespace="cms"
          value={object.type}
          onChange={this.onChange.bind(this, "type")}
        >
          <option value="undefined" default>Select visualization type</option>
          {Object.keys(vizLookup).map(type =>
            <option key={type} value={type}>{type}</option>
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

      {payload.data &&
        <div className="viz-select-group">
          {object.type && vizLookup[object.type] && vizLookup[object.type].map(prop =>
            // render prop as text input
            textFields.includes(prop)
              ? <TextInput
                label={prop === "imageURL" ? "Image URL" : prop}
                namespace="cms"
                fontSize="xs"
                key={prop}
                value={object[prop]}
                onChange={this.onChange.bind(this, prop)}
              />

              // render payload as checkboxes
              : checkboxFields.includes(prop)
                ? <fieldset className="cms-fieldset">
                  <legend className="u-font-sm">Columns</legend>
                  {Object.keys(firstObj).map(column =>
                    <label className="cms-checkbox-label u-font-xs" key={column}>
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(column)}
                        onChange={() => this.onCheck(column)}
                      /> {column}
                    </label>
                  )}
                </fieldset>

                // render prop as select
                : <Select
                  label={prop === "groupBy" ? "grouping" : prop}
                  namespace="cms"
                  fontSize="xs"
                  value={object[prop]}
                  onChange={this.onChange.bind(this, prop)}
                >
                  {/* optional fields */}
                  {object.type === "Graphic"
                    ? <option key={null} value="">none</option> : ""
                  }
                  {Object.keys(firstObj).map(type =>
                    <option key={type} value={type}>{type}</option>
                  )}
                </Select>
          )}
        </div>
      }
    </div>;
  }
}

const mapStateToProps = state => ({
  env: state.env,
  status: state.cms.status
});

export default connect(mapStateToProps)(SimpleVisualizationEditor);
