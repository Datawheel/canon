import React, {Component} from "react";
import {Navbar, Alignment} from "@blueprintjs/core";
import {NavCartControl} from "../src/";
import {connect} from "react-redux";

import "./App.css";

class App extends Component {

  render() {
    const mainClass = this.props.params.id ? `${this.props.params.id}-style` : "";
    const exampleId = this.props.params.id ? this.props.params.id : false;
    const homeLink = exampleId ? `/home/${exampleId}` : "/";
    const cartLink = exampleId ? `/cart/${exampleId}` : "/cart";

    return (
      <div id={mainClass} className="default-style">
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>
              <a href={homeLink}>
                {"🧪 Canon Cart Test"}
              </a>
            </Navbar.Heading>
            <Navbar.Divider />
            <a className="bp3-minimal" href={homeLink}>Home</a>
            <Navbar.Divider />
            <a className="bp3-minimal" href={cartLink}>Go to cart</a>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <NavCartControl cartRoute={cartLink} />
          </Navbar.Group>
        </Navbar>
        <div>
          { this.props.children }
        </div>
      </div>
    );
  }

}

export default connect(state => ({

}))(App);
