import React, {Component} from "react";
import {abbreviate} from "../../utils/formatters";
export default class SingleBar extends Component {

  render() {
    
    const {percent, label, number} = this.props;
    
    return (
      <div className="percent-wrapper">
        <p className="label s-size">{label}</p>
        <div className="pt-progress-bar pt-intent-primary pt-no-stripes">
          {!isNaN(percent) && <div className="pt-progress-meter" style={{width: `${percent}%`}}>
          </div>}          
        </div>
        <p className="percent-label xs-size">{isNaN(percent) ? "No data" : number ? abbreviate(number) : `${percent.toFixed(2)}%` }</p>
      </div>
    );
  }
}
