import axios from "axios";
import React, {Component} from "react";
import Button from "../fields/Button";
import Parse from "../sections/components/Parse";

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
      showText: "Show more",
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

    return (
      <div className="percentage-bar-wrapper">
        <ul className="percentage-bar-list">
          {displayData.filter(d => d).map((d, i) => {
            const percent = d[value] / total * 100;
            const label = d[groupBy];
            return (
              <React.Fragment key={`percentage-bar-${i}`}>
                <li className="percentage-bar-item">
                  <span className="percentage-bar-label label u-font-xs">
                    {label}
                  </span>

                  <span className="percentage-bar-value display u-font-md">
                    {numberFormat(d, value, total)}
                  </span>

                  <span className="u-visually-hidden">: </span>
                  {!isNaN(percent) &&
                    <span className="percentage-bar-bg">
                      <span className="percentage-bar" style={{width: `${percent}%`}} />
                    </span>
                  }

                </li>
              </React.Fragment>
            );
          })}
        </ul>
        <div className="show-more">
          {!showAll && cutoffText &&
            <div className="cutoff-text" dangerouslySetInnerHTML={{__html: cutoffText}}></div>
          }
          {(showAll || data.length > displayData.length) &&
            <Button
              fontSize="xs"
              iconPosition="left"
              icon={showAll ? "eye-off" : "eye-open"}
              onClick={() => this.setState({showAll: !this.state.showAll})}
            >
              {showAll ? hideText : showText}
            </Button>
          }
        </div>
      </div>
    );
  }
}

export default PercentageBar;
