import React, {Component} from "react";
import {AddToCartControl} from "@datawheel/canon-cart";

export default class CartIntro extends Component {

  render() {
    const url = `https://api.datamexico.org/tesseract/data?State=1&cube=economy_foreign_trade_ent&drilldowns=HS4&measures=Trade+Value&parents=true&sparse=false&locale=undefined&Year=2018&Flow=1`;
    return (
      <div>
        <h1>Cart Package</h1>
        <h2>Add to cart component</h2>
        <p>Create an individual add to Cart button.</p>
        <h3>Import:</h3>
        <code className="bp3-code">
          import &#123;AddToCartControl&#125; from "@datawheel/canon-cart";
        </code>
        <h3>Props:</h3>
        <ul>
          <li>query: (string) Absoulte url of a query to Mondrian, Tesseract or Logic Layer.</li>
          <li>tooltip: (boolean) Define if show tooltip on hover or not.</li>
        </ul>
        <h3>Usage:</h3>
        <code className="bp3-code">
          render() &#123;<br />
          &nbsp;const url = "https://api.datamexico.org/tesseract/data?State=1&cube=economy_foreign_trade_ent&drilldowns=HS4&measures=Trade+Value&parents=true&sparse=false&locale=undefined&Year=2018&Flow=1";<br />
          <br />
          &nbsp;return (<br />
          &nbsp;&nbsp;&lt;AddToCartControl query=&#123;url&#125; tooltip=&#123;true&#125; /&gt;<br />
          &nbsp;)<br />
          &#125;
        </code>
        <h3>Example:</h3>
        <AddToCartControl query={url} tooltip={true} />
      </div>
    );
  }
}
