import React, {Component} from "react";
import {Navbar, Alignment} from "@blueprintjs/core";
import {NavCartControl} from "../src/";
import "./App.css";

export default class App extends Component {

  render() {
    return (
      <div>
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>
              <a href="/">
                Test canon-cart package
              </a>
            </Navbar.Heading>
            <Navbar.Divider />
            <a className="bp3-minimal" href="/cart">Go to cart link!</a>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <NavCartControl cartRoute={"/cart"} />
          </Navbar.Group>
        </Navbar>
        <div>
          { this.props.children }
        </div>
      </div>
    );
  }

}
