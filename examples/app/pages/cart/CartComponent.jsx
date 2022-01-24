import React, {Component} from "react";
import {Cart} from "@datawheel/canon-cart";
import TopNav from "components/TopNav";
import Footer from "components/Footer";

export default class CartIntro extends Component {

  render() {
    return (
      <div>
        <TopNav />
        <Cart />
        <Footer />
      </div>
    );
  }
}
