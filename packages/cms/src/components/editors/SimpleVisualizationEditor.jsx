import React, {Component} from "react";
import {Alert, Intent} from "@blueprintjs/core";

import "./SimpleVisualizationEditor.css";

const vizLookup = {
  TreeMap: ["groupBy", "sum"],
  BarChart: ["x", "y", "z"],
  StackedArea: ["groupBy"]
};

export default class SimpleVisualizationEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      object: {},
      rebuildAlertOpen: false
    };
  }

  componentDidMount() {
    const {simpleConfig} = this.props;
    // If a simple config has been provided, then the user has used simple mode in the past.
    // Populate the simple menu accordingly and make it the default mode.
    let object = {};
    if (simpleConfig) {
      object = Object.assign({}, simpleConfig);
      this.setState({object}, this.compileCode.bind(this));
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

  compileCode() {
    const {object} = this.state;
    const {api} = this.props;
    const code = `return ${JSON.stringify(Object.assign({}, object, {data: api}))}`;
    if (this.props.onSimpleChange) this.props.onSimpleChange(code, object);
  }

  maybeRebuild() {
    this.setState({rebuildAlertOpen: true});
  }

  onChange(field, e) {
    const {object} = this.state;
    object[field] = e.target.value;
    this.setState({object}, this.compileCode.bind(this));
  }

  rebuild() {
    /*
    const {payload} = this.props;
    const pl = payload.data ? payload.data : payload;
    const objects = pl.map((obj, i) => 
      Object.keys(obj).map(k => ({
        use: true,
        keyName: `${k}${i + 1}`,
        pKey: k,
        pVal: obj[k]
      }))
    );
    this.setState({objects, rebuildAlertOpen: false}, this.compileCode.bind(this));
    */
    this.setState({rebuildAlertOpen: false});
  }

  render() {

    const {object, rebuildAlertOpen} = this.state;
    
    return <div className="simplemode">
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Rebuild"
        className="confirm-alert"
        iconName="pt-icon-warning-sign"
        intent={Intent.DANGER}
        isOpen={rebuildAlertOpen}
        onConfirm={this.rebuild.bind(this)}
        onCancel={() => this.setState({rebuildAlertOpen: false})}
      >
        Are you sure you want to rebuild this visualization from the current payload?
      </Alert>
      <button onClick={this.maybeRebuild.bind(this)}>Rebuild</button>
      <div>
        Data
        <input className="pt-input" value={object.api} onChange={this.onChange.bind(this, "api")} />
      </div>
      <div>
        Type 
        <div className="pt-select">
          <select value={object.type} onChange={this.onChange.bind(this, "type")}>
            {Object.keys(vizLookup).map(type => 
              <option key={type} value={type}>{type}</option>
            )}
          </select>
        </div>
      </div>
      <div className="viz-dropdowns">
        <ul>
          {
            object.type &&
              vizLookup[object.type].map(prop => 
                <li key={prop}>
                  {prop}: 
                  <div className="pt-select">
                    <select value={object[prop]} onChange={this.onChange.bind(this, prop)}>
                      {Object.keys({}).map(type => 
                        <option key={type} value={type}>{type}</option>
                      )}
                    </select>
                  </div>
                </li>
              )
          }
        </ul>
      </div>
    </div>;

  }
}
