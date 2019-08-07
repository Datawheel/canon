import React, {Component} from "react";
import {Cart} from "../../src/";

import "./CartPage.css";

export default class CartPage extends Component {

  render() {
    return (
      <div id="cart-example">
        <Cart />
      </div>
    );
  }

}
