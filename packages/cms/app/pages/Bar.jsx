import React, {Component} from "react";
import Viz from "../../src/components/Viz";

export default class Bar extends Component {
  
  render() {

    const logic = `return {
      type: "PercentageBar",
      data: [
        {name: "jim", count: 5},
        {name: "dave", count: 7},
        {name: "alex", count: 10}
      ],
      dataFormat: d => d,
      total: 100,
      groupBy: "name",
      value: "count"  
  }
  `;

    return (
      <div id="Bar">
        <Viz 
          config={{logic}}
        />
      </div>
    );
  }

}
