import axios from "axios";
import React, {Component} from "react";
import Stat from "../sections/components/Stat";
import "./Graphic.css";

class Graphic extends Component {

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
      numberFormat: (d, value, total) => {
        const perc = Number(d[value] / total * 100);
        return isNaN(perc) ? "No Data" : `${perc.toFixed(2)}%`;
      }
    };

    const config = Object.assign({}, defaults, propConfig);

    // prevent the page from white screening when config/data is malformed
    if (!config || !config.data) {
      console.log("no config/data");
    }
    // If the data is an API call, run the axios get and replace .data with its results
    else if (typeof config.data === "string") {
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
    if (!this.state) return null;
    const {config} = this.state;
    if (!config) return null;
    const {data} = config;

    return (
      <div className="cp-graphic">
        {data.img &&
          <img src={data.img} className="cp-graphic-img" alt="" />
        }
        <Stat
          className="cp-graphic-stat"
          label={data.label}
          value={data.value}
          subtitle={data.subtitle}
        />
      </div>
    );
  }
}

export default Graphic;
