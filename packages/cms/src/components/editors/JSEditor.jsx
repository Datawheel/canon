import React, {Component} from "react";
import {EditableText, Checkbox} from "@blueprintjs/core";

export default class JSEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rows: []
    };
  }

  componentDidMount() {
    const {payload, ez} = this.props;
    // If an ez config has been provided, then the user has used ez in the past.
    // Populate the ez menu accordingly and make it the default mode.
    let rows = [];
    if (ez) {
      rows = ez.map(r => ({
        use: r.use,
        keyName: r.keyName,
        pKey: r.pKey,
        pVal: payload[r.pKey]
      }));
    }
    // If an ez config has not been provided, then the user has never used one before,
    // so prepare the interface based on the payload itself
    else {
      rows = Object.keys(payload).map(k => ({
        use: true,
        keyName: k,
        pKey: k,
        pVal: payload[k]
      }));
    }
    this.setState({rows});
  }

  compileCode() {
    const {rows} = this.state;
    const code = `return {
      ${rows.filter(r => r.use).map(row => `${row.keyName}: resp["${row.pKey}"]`)}
    };`;
    // Do not save the value of the variable to the database - these are computed 
    // at "run-time" from the results of the API call.
    const dbRows = rows.map(r => {
      delete r.pVal;
      return r;
    });
    if (this.props.onEZChange) this.props.onEZChange(code, dbRows);
  }

  changeKey(pKey, str) {
    const {rows} = this.state;
    const row = rows.find(r => r.pKey === pKey);
    if (row) row.keyName = str;
    this.setState({rows}, this.compileCode.bind(this));
  }

  changeUse(pKey, e) {
    const {rows} = this.state;
    const row = rows.find(r => r.pKey === pKey);
    if (row) row.use = e.target.checked;
    this.setState({rows}, this.compileCode.bind(this));  
  }

  render() {

    const {rows} = this.state;
    
    return <div id="ezmode">
      {
        rows.map(row => 
          <div key={row.pKey}>
            <Checkbox checked={row.use} style={{width: "20px"}} onChange={this.changeUse.bind(this, row.pKey)}/>
            <EditableText 
              defaultValue={row.pKey} 
              onChange={this.changeKey.bind(this, row.pKey)} />
            <span>{row.pKey}</span>&nbsp;&nbsp;&nbsp;&nbsp;
            <span>{String(row.pVal)}</span>
          </div>
        )
      }
    </div>;

  }
}
