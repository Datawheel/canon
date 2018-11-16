import React, {Component} from "react";
import {EditableText, Checkbox} from "@blueprintjs/core";

import "./JSEditor.css";

export default class JSEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      objects: []
    };
  }

  componentDidMount() {
    const {payload, ez} = this.props;
    // If an ez config has been provided, then the user has used ez in the past.
    // Populate the ez menu accordingly and make it the default mode.
    let objects = [];
    if (ez) {
      objects = ez.map((objArr, i) => 
        objArr.map(o => ({
          use: o.use,
          keyName: o.keyName,
          pKey: o.pKey,
          pVal: payload[i][o.pKey]
        }))
      );
      this.setState({objects});
    }
    // If an ez config has not been provided, then the user has never used one before,
    // so prepare the interface based on the payload itself
    else {
      objects = payload.map(obj => 
        Object.keys(obj).map(k => ({
          use: true,
          keyName: k,
          pKey: k,
          pVal: obj[k]
        }))
      );
      // If this component is mounting and is NOT provided an ez config, it means the
      // user has just enabled ezmode. This means the parent component must be given
      // the ez config NOW, so if the user clicks save without editing anything, it's there.
      this.setState({objects}, this.compileCode.bind(this));
    }
  }

  compileCode() {
    const {objects} = this.state;
    const {payload} = this.props;
    const prepend = payload.data ? "resp.data" : "resp";
    const code = `return {
      ${objects.map(o => o).filter(r => r.use).map(row => `${row.keyName}: ${prepend}["${row.pKey}"]`)}
    };`;
    // Do not save the value of the variable to the database - these are computed 
    // at "run-time" from the results of the API call. Only save user data.
    const dbRows = objects.map(o => o).map(r => ({
      use: r.use,
      keyName: r.keyName,
      pKey: r.pKey
    }));
    if (this.props.onEZChange) this.props.onEZChange(code, dbRows);
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

  render() {

    const {objects} = this.state;
    
    return <div className="ezmode">
      {
        objects.map((objArr, i) => 
          <div key={i} className="obj" style={{outline: "1px solid black"}}>
            {`THING ${i}`}
            {objArr.map(row => 
              <div key={row.pKey} className="field-row">
                <Checkbox checked={row.use} onChange={this.changeUse.bind(this, i, row.pKey)}/>
                <EditableText 
                  defaultValue={row.keyName} 
                  onChange={this.changeKey.bind(this, i, row.pKey)} />
                <span>{row.pKey}</span>&nbsp;&nbsp;&nbsp;&nbsp;{/* lol sorry james */}
                <span>{String(row.pVal)}</span>
              </div>          
            )}
          </div>
        )
      }
    </div>;

  }
}
