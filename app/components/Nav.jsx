import React, {Component} from "react";
import "./Nav.css";

class Nav extends Component {

  render() {
    return (
      <nav className="nav">
        <a className="logo" href="/">Canonical Design</a>
        <a href="/profile">Profile</a>
      </nav>
    );
  }
}

export default Nav;
