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
    const {payload} = this.props;
    // In the future, need to load this from some config?
    // or reverse engineer it from the saved code?
    const rows = Object.keys(payload).map(k => ({
      use: true,
      keyName: k,
      pKey: k,
      pVal: payload[k]
    }));
    this.setState({rows});
  }

  convertObjectToCode() {
    const {rows} = this.state;
    return `return {
      ${rows.filter(r => r.use).map(row => `${row.keyName}: "${row.pVal}"`)}
    }`;
  }

  compileCode() {
    const {rows} = this.state;
    const code = `return {
      ${rows.filter(r => r.use).map(row => `${row.keyName}: "${row.pVal}"`)}
    };`;
    if (this.props.onEZChange) this.props.onEZChange(code);
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
