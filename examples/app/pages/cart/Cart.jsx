import React, {Component} from "react";
import {Link} from "react-router";

export default class CartIntro extends Component {

  render() {
    return (
      <div>
        <h1>Cart Package</h1>
        <h2>Cart panel component</h2>
        <p>Full page Cart component.</p>
        <h3>Import:</h3>
        <code className="bp3-code">
          import &#123;Cart&#125; from "@datawheel/canon-cart";
        </code>
        <h3>Props</h3>
        <p>None</p>
        <h3>Usage:</h3>
        <code className="bp3-code">
          render() &#123;<br />
          &nbsp;return (<br />
          &nbsp;&nbsp;&lt;Cart /&gt;<br />
          &nbsp;)<br />
          &#125;
        </code>
        <h3>Example:</h3>
        <Link to="/cart">Go to cart page</Link>
      </div>
    );
  }
}
