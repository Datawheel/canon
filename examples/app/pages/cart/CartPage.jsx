import React, {Component} from "react";
import {Cart} from "@datawheel/canon-cart";
import TopNav from "components/TopNav";

export default class CartPage extends Component {

  render() {
    return (
      <div>
        <TopNav />
        <Cart />
      </div>
    );
  }
}
