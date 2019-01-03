import React, {Component} from "react";
import Viz from "../../src/components/Viz";

export default class Bar extends Component {
  
  render() {

    const logic = `return {
      type: "PercentageBar",
      data: [
        {name: "jim", count: 5},
        {name: "dave", count: 7},
        {name: "alex", count: 10},
        {name: "walther", count: 2},
        {name: "james", count: 14},
        {name: "jonathan", count: 6},
        {name: "valerie", count: 6}
      ],
      dataFormat: d => d,
      groupBy: "name",
      cutoff: data => data.filter(d => d.name == "jim" || d.name == "dave" || d.name == "jonathan" || d.name == "walther"),
      cutoffText: "showing blah blah blah blah blah",
      sort: (a, b) => a.name == "jonathan" ? -1 : 1,
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
