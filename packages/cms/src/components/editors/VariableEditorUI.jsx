import React, {Component} from "react";
import {EditableText} from "@blueprintjs/core";
import Alert from "../interface/Alert";
import Button from "../fields/Button";
import ButtonGroup from "../fields/ButtonGroup";

import "./VariableEditorUI.css";

const buttonProps = {
  namespace: "cms",
  fontSize: "xxs"
};

export default class VariableEditorUI extends Component {

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
    // Bug: The deepclone used in VariableEditor erroneously logic_simple from NULL to {}
    // Therefore, detect the blank object as another expression of NULLness
    const configIsEmptyObject = simpleConfig.constructor === Object && Object.keys(simpleConfig).length === 0;
    if (simpleConfig && !configIsEmptyObject) {
      objects = simpleConfig.map((objArr, i) =>
        objArr.map(o => ({
          use: o.use,
          keyName: o.keyName,
          pKey: o.pKey,
          pVal: pl[i] ? pl[i][o.pKey] : undefined
        }))
      );
      this.setState({objects}, this.compileCode.bind(this));
    }
    // If a simple config has not been provided, then the user has never used one before,
    // so prepare the interface based on the payload itself
    else {
      if (Array.isArray(pl)) {
        objects = pl.map((obj, i) =>
          Object.keys(obj).map(k => ({
            use: true,
            keyName: `${this.camelize(k)}${i + 1}`,
            pKey: k,
            pVal: obj[k]
          }))
        );
      }
      else {
        objects = [];
      }

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

  useAll() {
    let {objects} = this.state;
    objects = objects.map(object => object.map(o => Object.assign({}, o, {use: true})));
    this.setState({objects}, this.compileCode.bind(this));
  }

  useNone() {
    let {objects} = this.state;
    objects = objects.map(object => object.map(o => Object.assign({}, o, {use: false})));
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

    const rebuildButtonProps = {
      className: "cms-variable-editor-heading-button",
      onClick: this.maybeRebuild.bind(this),
      fontSize: "xxs",
      namespace: "cms",
      icon: "undo",
      iconPosition: "left",
      key: "b"
    };

    return <div className="cms-variable-editor-ui">
      <h3 className="cms-variable-editor-heading u-font-xs">
        Generated variables <Button {...rebuildButtonProps}>rebuild</Button>
      </h3>

      <div className="cms-variable-table-wrapper">
        <table className="cms-variable-table">
          <thead>
            <tr>
              <td>use <ButtonGroup className="cms-variable-table-button-group">
                <Button
                  onClick={() => this.useAll()}
                  {...buttonProps}
                >
                  <span className="u-visually-hidden">use</span> all
                </Button>
                <Button
                  onClick={() => this.useNone()}
                  {...buttonProps}
                >
                  <span className="u-visually-hidden">use</span> none
                </Button>
              </ButtonGroup>
              </td>
              <td>custom name</td>
              <td>key</td>
              <td>value</td>
            </tr>
          </thead>
          {objects.map((objArr, i) =>
            <tbody key={objArr.i}>
              {objArr.map(row =>
                <tr className={`cms-variable-table-row ${row.use ? "is-active" : "is-inactive"}`} key={row.pKey}>
                  <td>
                    <input type="checkbox" checked={row.use} onChange={this.changeUse.bind(this, i, row.pKey)} />
                  </td>
                  <td>
                    <EditableText
                      value={row.keyName}
                      onChange={this.changeKey.bind(this, i, row.pKey)} />
                  </td>
                  <td>{row.pKey}</td>
                  <td>{String(row.pVal)}</td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <Alert
        title="Rebuild variables from the current payload?"
        cancelButtonText="Cancel"
        confirmButtonText="Rebuild"
        className="confirm-alert"
        isOpen={rebuildAlertOpen}
        onConfirm={this.rebuild.bind(this)}
        onCancel={() => this.setState({rebuildAlertOpen: false})}
      />
    </div>;
  }
}
