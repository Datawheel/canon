import axios from "axios";
import React, {Component} from "react";
import {abbreviate} from "../../utils/formatters";

import "./PercentageBar.css";

class PercentageBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config: null
    };
  }

  componentDidMount() {
    const propConfig = this.props.config;

    const defaults = {
      cutoff: 5,
      dataFormat: d => d
    };

    const config = Object.assign({}, defaults, propConfig);

    // If the data is an API call, run the axios get and replace .data with its results
    if (typeof config.data === "string") {
      axios.get(config.data).then(resp => {
        config.data = config.dataFormat(resp.data);
        if (!config.total) config.total = config.data.reduce((acc, d) => acc += d[config.value], 0);
        this.setState({config});
      });
    }
    else {
      config.data = config.dataFormat(config.data);
      if (!config.total) config.total = config.data.reduce((acc, d) => acc += d[config.value], 0);
      this.setState({config});
    }
  }

  render() {

    const {showAll, config} = this.state;

    if (!config) return null;

    const {data, cutoff, title, value, groupBy, total} = config;

    const displayData = showAll ? data : data.slice(0, cutoff);
  
    return <div id="PercentageBar">
      <h3 className="pb-title">{title}</h3>
      { 
        displayData.map((d, i) => {
          const percent = d[value] / total * 100;
          const label = d[groupBy];
          const number = d[value];
          return <div key={`pb-${i}`}className="percent-wrapper">
            <p className="label s-size">{label}</p>
            <div className="pt-progress-bar pt-intent-primary pt-no-stripes">
              {!isNaN(percent) && <div className="pt-progress-meter" style={{width: `${percent}%`}}>
              </div>}      
              <p className="percent-label xs-size">{isNaN(percent) ? "No data" : number ? abbreviate(number) : `${percent.toFixed(2)}%` }</p>    
            </div>
          </div>;
        })
      }
      {data.length > cutoff && <button onClick={() => this.setState({showAll: !this.state.showAll})}>{showAll ? "Hide" : "Show More"}</button>}
    </div>;

  }
}

export default PercentageBar;
