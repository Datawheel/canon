import React, {Component} from "react";
import {Navbar, Alignment} from "@blueprintjs/core";
import {NavCartControl} from "../src/";
import {connect} from "react-redux";

import "./App.css";

class App extends Component {

  render() {
    const {activeSite, exampleList} = this.props;
    const mainClass = exampleList[activeSite] ? exampleList[activeSite].slug:'';
    return (
      <div id={mainClass} className="default-style">
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>
              <a href="/">
                {`${activeSite ? activeSite + ' Cart Test' :'🧪 Canon Cart Test'}`}
              </a>
            </Navbar.Heading>
            <Navbar.Divider />
            <a className="bp3-minimal" href="/">Home</a>
            <Navbar.Divider />
            <a className="bp3-minimal" href="/cart">Go to cart</a>
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

export default connect(state => {
  return {
    activeSite: state.example.site,
    exampleList: state.example.exampleList
  };
})(App);
