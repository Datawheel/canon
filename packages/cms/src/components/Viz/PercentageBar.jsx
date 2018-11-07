import axios from "axios";
import React, {Component} from "react";
import SingleBar from "./SingleBar";

import "./PercentageBar.css";

class PercentageBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config: null
    };
  }

  componentDidMount() {
    
    // const {config} = this.props;
    
    let config = {
      cutoff: 3,
      data: "http://localhost:3300/api/test",
      dataFormat: d => d,
      groupBy: "state",
      value: "rate",
      type: "PercentageBar",
      total: 100,
      title: "All States"
    };

    const defaults = {
      cutoff: 5,
      dataFormat: d => d
    };

    config = Object.assign({}, defaults, config);

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
    
    const bars = displayData.map((d, i) => 
      <SingleBar 
        key={`bar-${i}`} 
        percent={d[value] / total * 100} 
        label={d[groupBy]} 
        number={d[value]} 
      />
    );

    return <div id="PercentageBar">
      <h3 className="pb-title">{title}</h3>
      {bars}
      {data.length > cutoff && <button onClick={() => this.setState({showAll: !this.state.showAll})}>{showAll ? "Hide" : "Show More"}</button>}
    </div>;

  }
}

export default PercentageBar;
