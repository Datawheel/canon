import axios from "axios";
import React, {Component} from "react";

import "./PercentageBar.css";

class PercentageBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config: null
    };
  }

  componentDidMount() {
    this.buildConfig.bind(this)();
  }

  buildConfig() {
    const propConfig = this.props.config;
    const {dataFormat} = this.props;

    const defaults = {
      cutoff: 5,
      cutoffText: false,
      numberFormat: (d, value, total) => {
        const perc = Number(d[value] / total * 100);
        return isNaN(perc) ? "No Data" : `${perc.toFixed(2)}%`;
      },
      showText: "Show More",
      hideText: "Hide"
    };

    const config = Object.assign({}, defaults, propConfig);

    // If the data is an API call, run the axios get and replace .data with its results
    if (typeof config.data === "string") {
      axios.get(config.data).then(resp => {
        config.data = dataFormat(resp.data);
        if (!config.total) config.total = config.data.reduce((acc, d) => isNaN(d[config.value]) ? acc : acc + Number(d[config.value]), 0);
        this.setState({config});
      });
    }
    else {
      config.data = dataFormat(config.data);
      if (!config.total) config.total = config.data.reduce((acc, d) => isNaN(d[config.value]) ? acc : acc + Number(d[config.value]), 0);
      this.setState({config});
    }
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.config) !== JSON.stringify(this.props.config)) {
      this.setState({config: null}, this.buildConfig.bind(this));
    }
  }

  render() {

    const {showAll, config} = this.state;

    if (!config) return null;

    const {data, cutoff, cutoffText, title, value, groupBy, sort, total, numberFormat, showText, hideText} = config;

    const cutoffFunction = typeof cutoff === "number" ? data => data.slice(0, cutoff) : cutoff;

    let displayData = showAll ? data : cutoffFunction(data);

    if (sort) displayData = displayData.sort(sort);
  
    return <div className="PercentageBar">
      <h3 className="pb-title" dangerouslySetInnerHTML={{__html: title}} />
      { 
        displayData.map((d, i) => {
          const percent = d[value] / total * 100;
          const label = d[groupBy];
          return <div key={`pb-${i}`}className="percent-wrapper">
            <p className="label s-size">{label}</p>
            <div className="bp3-progress-bar bp3-intent-primary bp3-no-stripes">
              {!isNaN(percent) && <div className="bp3-progress-meter" style={{width: `${percent}%`}}>
              </div>}      
              
            </div>
            <p className="percent-label xs-size">{numberFormat(d, value, total)}</p>    
          </div>;
        })
      }
      <div className="show-more">
        {!showAll && cutoffText && <div className="cutoff-text">{cutoffText}</div>}
        {(showAll || data.length > displayData.length) && <button onClick={() => this.setState({showAll: !this.state.showAll})}>{showAll ? hideText : showText}</button>}
      </div>
    </div>;

  }
}

export default PercentageBar;
