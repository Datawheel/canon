import axios from "axios";
import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";
import Button from "../fields/Button";
import Parse from "../sections/components/Parse";
import "./PercentageBar.css";

class PercentageBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config: null
    };

    this.viz = React.createRef();
  }

  componentDidMount() {
    this.buildConfig.bind(this)();
  }

  buildConfig() {
    const propConfig = this.props.config;
    const {dataFormat} = this.props;

    const defaults = {
      cutoff: 2,
      cutoffText: false,
      numberFormat: (d, value, total) => {
        const perc = Number(d[value] / total * 100);
        return isNaN(perc) ? "No Data" : `${perc.toFixed(2)}%`;
      },
      showText: "Show all",
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

    // Create ticks and labels
    let labelVal, xPos;
    const lines = [];
    const ticks = [];
    const obj = {};
    for (let i = 0; i <= 10; i++) {
      // ensure first line isn't cropped left
      xPos = i === 0 ? "0.1%" : `${i * 10  }%`;

      // generate arguments for numberFormat
      obj.tickValue = (total * (i * 0.1)).toFixed(2);
      labelVal = numberFormat(obj, "tickValue", total);

      lines.push(<line key={`line-${xPos}-${labelVal}`} x1={xPos} x2={xPos} y1="0" y2="100%"/>);
      ticks.push(<text key={`tick-${xPos}-${labelVal}`} x={xPos} y="100%">{labelVal}</text>);
    }

    return (
      <Fragment>
        <div className={`percentage-bar-wrapper ${`${labelVal}`.includes("%") ? "is-percent" : ""}`} ref={this.viz} key="percentage-bar-wrapper">

          <div className="precentage-bar-grid-holder">
            <svg className="percentage-bar-grid">
              <defs>
                <clipPath id="percentage-bar-clip">
                  <rect x="0" y="0" width="100%" height={showAll ? "99%" : "88%"} />
                </clipPath>
              </defs>
              <g className="percentage-bar-ticks">
                {lines}
              </g>
              <g className="percentage-bar-labels">
                {ticks}
              </g>
            </svg>
          </div>

          <ul className="percentage-bar-list">
            {displayData.filter(d => d).map((d, i) => {
              const percent = d[value] / total * 100;
              const label = d[groupBy];
              return (
                <li key={`percentage-bar-${label}-${percent}-${i}`} className="percentage-bar-item">
                  <span className="percentage-bar-label label u-font-xs">
                    {label}<span className="u-visually-hidden">: </span>
                  </span>

                  <span className="percentage-bar-value display u-font-md">
                    {numberFormat(d, value, total)}
                  </span>

                  {!isNaN(percent) &&
                    <span className="percentage-bar-bg">
                      <span className="percentage-bar" style={{width: `${percent}%`}} />
                    </span>
                  }
                </li>
              );
            })}
          </ul>
        </div>
        <div className="show-more" key="show-more">
          {!showAll && cutoffText &&
            <Parse className="cutoff-text">{cutoffText}</Parse>
          }
          {showAll || data.length > displayData.length
            ? <Button
              fontSize="xs"
              iconPosition="left"
              icon={showAll ? "eye-off" : "eye-open"}
              onClick={() => this.setState({showAll: !this.state.showAll})}
            >
              {showAll ? hideText : showText}
            </Button> : ""
          }
        </div>
      </Fragment>
    );
  }
}

export default hot(PercentageBar);
