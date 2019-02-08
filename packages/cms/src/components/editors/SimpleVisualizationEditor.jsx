import axios from "axios";
import React, {Component} from "react";
import {Alert, Intent} from "@blueprintjs/core";
import urlSwap from "../../utils/urlSwap";

import "./SimpleVisualizationEditor.css";

const vizLookup = {
  AreaPlot: ["groupBy", "x", "y"],
  BarChart: ["groupBy", "x", "y"],
  BumpChart: ["groupBy", "x", "y"],
  Donut: ["groupBy", "value"],
  Geomap: ["groupBy", "colorScale", "topojson"],
  LinePlot: ["groupBy", "x", "y"],
  PercentageBar: ["groupBy", "value"],
  Pie: ["groupBy", "value"],
  StackedArea: ["groupBy", "x", "y"],
  Treemap: ["groupBy", "sum"]
};

const reservedWords = ["topojson"];

export default class SimpleVisualizationEditor extends Component {

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
    const {preview, variables} = this.props;
    const {data} = object;
    if (data) {
      // The API will have an <id> in it that needs to be replaced with the current preview.
      // Use urlSwap to swap ANY instances of variables between brackets (e.g. <varname>)
      // With its corresponding value.
      const url = urlSwap(data, Object.assign({}, variables, {id: preview}));
      axios.get(url).then(resp => {
        const payload = resp.data;
        this.setState({payload}, this.compileCode.bind(this));
      }).catch(() => {
        console.log("API error");
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
          return `\n  "${k}": "${object[k]}"`;
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

  rebuild() {
    const {object} = this.state;
    const {data, type} = object;
    axios.get(data).then(resp => {
      const payload = resp.data;
      const firstObj = payload.data[0];
      const newObject = {
        data: object.data,
        type: object.type
      };
      if (vizLookup[type] && firstObj) {
        vizLookup[type].forEach(f => newObject[f] = Object.keys(firstObj)[0]);
      }
      this.setState({payload, object: newObject, rebuildAlertOpen: false}, this.compileCode.bind(this));
    }).catch(() => {
      console.log("API error");
    });
  }

  render() {

    const {object, rebuildAlertOpen, payload} = this.state;

    const firstObj = payload && payload.data && payload.data[0] ? payload.data[0] : object;

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
      <div className="cms-field-container">
        <label className="label" htmlFor="data">Data</label>
        <div className="cms-field-container-inline bp3-input-group">
          <input className="bp3-input" value={object.data} onChange={this.onChange.bind(this, "data")} id="data"/>
          {object.data &&
            <button className="cms-button bp3-button" onClick={this.maybeRebuild.bind(this)}>
              {payload.data ? "Rebuild" : "Build"}
            </button>
          }
        </div>
      </div>

      <div className="cms-field-container">
        Type
        <div className="bp3-select">
          <select value={object.type} onChange={this.onChange.bind(this, "type")}>
            {Object.keys(vizLookup).map(type =>
              <option key={type} value={type}>{type}</option>
            )}
          </select>
        </div>
      </div>


      {payload.data &&
        <ul className="viz-dropdown-list">
          {
            object.type &&
              vizLookup[object.type].map(prop =>
                <li key={prop}>
                  {prop}:
                  {reservedWords.includes(prop)
                    ? <input key={prop} value={object[prop]} onChange={this.onChange.bind(this, prop)} />
                    : <div className="bp3-select">
                      <select value={object[prop]} onChange={this.onChange.bind(this, prop)}>
                        {Object.keys(firstObj).map(type =>
                          <option key={type} value={type}>{type}</option>
                        )}
                      </select>
                    </div>
                  }
                </li>
              )
          }
        </ul>
      }
    </div>;

  }
}
