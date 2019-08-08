import React, {Component} from "react";
import {AddToCartControl} from "../../src/";

import "./Home.css";

export default class Home extends Component {

  render() {
    const queryList = [
      {title: "query 1", query: "query_1", tooltip: false},
      {title: "query 1 again", query: "query_1", tooltip: true},
      {title: "query 2", query: "query_2", tooltip: false},
      {title: "query 3", query: "query_3", tooltip: true},
      {title: "query 4", query: "query_4", tooltip: false},
      {title: "query 5", query: "query_5", tooltip: true},
      {title: "query 6", query: "query_6", tooltip: false}
    ];

    return (
      <div id="home">
        <div className="content">
          <h1>Test AddToCartControl in charts</h1>
          {queryList.map((q, ix) =>
            <div key={ix}>
              <h2>{q.title} <small>(tooltip: {q.tooltip ? "true" : "false"})</small></h2>
              <AddToCartControl query={q.query} tooltip={q.tooltip} />
            </div>
          )}
        </div>
      </div>
    );
  }

}
