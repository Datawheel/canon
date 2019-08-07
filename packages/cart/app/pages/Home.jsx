import React, {Component} from "react";
import {AddToCartControl, NavCartControl} from "../../src/";
import {Navbar, Alignment} from "@blueprintjs/core";

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
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>Test canon-cart package</Navbar.Heading>
            <Navbar.Divider />
            <a className="bp3-minimal" href="/cart">Go to cart link!</a>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <NavCartControl cartRoute={"/cart"} />
          </Navbar.Group>
        </Navbar>
        <div className="content">
          {queryList.map((q, ix) =>
            <div key={ix}>
              <h1>AddToCart {q.title} <small>(tooltip: {q.tooltip ? "true" : "false"})</small></h1>
              <AddToCartControl query={q.query} tooltip={q.tooltip} />
            </div>
          )}
        </div>
      </div>
    );
  }

}
