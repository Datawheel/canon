import React, {Component} from "react";

class PercentageBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dataObj: {}
    };
  }

  componentDidMount() {
    
  }

  render() {

    const dataObj = {
      cutoff: 5,
      data: [
        {state: "mass", rate: 23}, 
        {state: "ny", rate: 34}, 
        {state: "connecticut", rate: 54}
      ],
      dataFormat: d => d,
      groupBy: "state",
      value: "rate",
      type: "PercentageBar",
      title: "All States"
    };

    return <div className="PercentageBar">
      stub
    </div>;

  }
}

export default PercentageBar;
