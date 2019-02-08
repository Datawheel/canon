import React, {Component} from "react";
import {EditableText, Checkbox, Alert, Intent} from "@blueprintjs/core";

import "./SimpleGeneratorEditor.css";

export default class SimpleGeneratorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      objects: [],
      rebuildAlertOpen: false
    };
  }

  componentDidMount() {
    this.populate.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.payload !== this.props.payload) this.populate.bind(this)();
  }

  camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  populate() {
    const {payload, simpleConfig} = this.props;
    // If the error prop exists in the payload, then the user has either not yet configured,
    // or has incorrectly configured the API call.
    if (payload.error) return;
    // If a simple config has been provided, then the user has used simple mode in the past.
    // Populate the simple menu accordingly and make it the default mode.
    let objects = [];
    let pl = payload;
    if (payload.results) pl = payload.results;
    if (payload.data) pl = payload.data;
    if (simpleConfig) {
      objects = simpleConfig.map((objArr, i) =>
        objArr.map(o => ({
          use: o.use,
          keyName: o.keyName,
          pKey: o.pKey,
          pVal: pl[i][o.pKey]
        }))
      );
      this.setState({objects}, this.compileCode.bind(this));
    }
    // If a simple config has not been provided, then the user has never used one before,
    // so prepare the interface based on the payload itself
    else {
      objects = pl.map((obj, i) =>
        Object.keys(obj).map(k => ({
          use: true,
          keyName: `${this.camelize(k)}${i + 1}`,
          pKey: k,
          pVal: obj[k]
        }))
      );
      // If this component is mounting and is NOT provided a simple config, it means the
      // user has just enabled simple mode. This means the parent component must be given
      // the simple logic NOW, so if the user clicks save without editing anything, it's there.
      this.setState({objects}, this.compileCode.bind(this));
    }
  }

  compileCode() {
    const {objects} = this.state;
    const {payload} = this.props;
    let prepend = "resp";
    if (payload.results) prepend = "resp.results";
    if (payload.data) prepend = "resp.data";
    const code =
    `return {${objects
      // For every object that was returned in the payload (represented as an array of keys), and the index of that object
      .map((o, i) => o
        // Filter out any keys that the user decided not to export
        .filter(r => r.use)
        // Using a string template, create the key export
        .map(row => `\n  ${row.keyName}: ${prepend}[${i}]["${row.pKey}"]`))
      // If the "use filter" resulted in a completely empty array, filter it out so no "dead commas" end up in the javascript
      .filter(d => d.length)}\n};`;
    // Do not save the value of the variable to the database - these are computed
    // at "run-time" from the results of the API call. Only save user data.
    const dbRows = objects.map(o => o.map(r => ({
      use: r.use,
      keyName: r.keyName,
      pKey: r.pKey
    })));
    if (this.props.onSimpleChange) this.props.onSimpleChange(code, dbRows);
  }

  changeKey(i, pKey, str) {
    const {objects} = this.state;
    const row = objects[i].find(r => r.pKey === pKey);
    if (row) row.keyName = str;
    this.setState({objects}, this.compileCode.bind(this));
  }

  changeUse(i, pKey, e) {
    const {objects} = this.state;
    const row = objects[i].find(r => r.pKey === pKey);
    if (row) row.use = e.target.checked;
    this.setState({objects}, this.compileCode.bind(this));
  }

  changeAll(i, e) {
    const {objects} = this.state;
    objects[i] = objects[i].map(o => Object.assign({}, o, {use: e.target.checked}));
    this.setState({objects}, this.compileCode.bind(this));
  }

  maybeRebuild() {
    this.setState({rebuildAlertOpen: true});
  }

  rebuild() {
    const {payload} = this.props;
    if (payload.error) {
      this.setState({rebuildAlertOpen: false});
      return;
    }
    let pl = payload;
    if (payload.results) pl = payload.results;
    if (payload.data) pl = payload.data;
    const objects = pl.map((obj, i) =>
      Object.keys(obj).map(k => ({
        use: true,
        keyName: `${this.camelize(k)}${i + 1}`,
        pKey: k,
        pVal: obj[k]
      }))
    );
    this.setState({objects, rebuildAlertOpen: false}, this.compileCode.bind(this));
  }

  render() {

    const {objects, rebuildAlertOpen} = this.state;

    return <div className="simplemode">
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
        Are you sure you want to rebuild your variables from the current payload?
      </Alert>
      <div className="cms-label">
        Generated variables <button className="cms-button cms-button-icon-only" onClick={this.maybeRebuild.bind(this)}>
          <span className="bp3-icon bp3-icon-undo" />
        </button>
      </div>

      {/* <tr key={i} className="obj">
          <td>
            {`Object ${i}`}
          </td>
          <td>
            <Checkbox checked={objArr.every(r => r.use)} onChange={this.changeAll.bind(this, i)}/>
          </td>
      </tr>*/}
      <table className="cms-table">
        {objects.map((objArr, i) =>
          <tbody className="cms-table-group" key={objArr.i}>
            {objArr.map(row =>
              <tr key={row.pKey} className="cms-field-row">
                <td>
                  <Checkbox checked={row.use} onChange={this.changeUse.bind(this, i, row.pKey)}/>
                </td>
                <td>
                  <EditableText
                    defaultValue={row.keyName}
                    onChange={this.changeKey.bind(this, i, row.pKey)} />
                </td>
                <td>{row.pKey}</td>
                <td>{String(row.pVal)}</td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </div>;
  }
}
