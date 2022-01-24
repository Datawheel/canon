import React, {Component} from "react";
import {NavCartControl} from "@datawheel/canon-cart";

export default class CartIntro extends Component {

  render() {
    const url = `https://api.datamexico.org/tesseract/data?State=1&cube=economy_foreign_trade_ent&drilldowns=HS4&measures=Trade+Value&parents=true&sparse=false&locale=undefined&Year=2018&Flow=1`;
    return (
      <div>
        <h1>Cart Package</h1>
        <h2>Nav Cart component</h2>
        <p>Create a Cart button to include in your navbar. It shows the number of datasets and on hover a tooltip appears with the list of datasets added and download and clear buttons.</p>
        <h3>Import:</h3>
        <code className="bp3-code">
          import &#123;NavCartControl&#125; from "@datawheel/canon-cart";
        </code>
        <h3>Props:</h3>
        <ul>
          <li>cartRoute: (string) Path of your cart route -just to complete the links-.</li>
        </ul>
        <h3>Usage:</h3>
        <code className="bp3-code">
          render() &#123;<br />
          &nbsp;return (<br />
          &nbsp;&nbsp;&lt;NavCartControl cartRoute=&#123;"/cart"&#125; /&gt;<br />
          &nbsp;)<br />
          &#125;
        </code>
        <h3>Example:</h3>
        <NavCartControl cartRoute={"/docs/cart-package/cart"} />
        <hr />
        <p>Also you can see it working in the very top right corner of this site.</p>
      </div>
    );
  }
}
