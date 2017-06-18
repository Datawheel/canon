import React, {Component} from "react";
import {Link} from "react-router";
import "./Nav.css";

class Nav extends Component {

  render() {
    return (
      <nav className="nav">
        <Link className="logo" to="/">Canonical Design</Link>
        <Link className="link" to="/profile/040AF00182">Nigeria</Link>
        <Link className="link" to="/profile/040AF00079">Ethopia</Link>
      </nav>
    );
  }
}

export default Nav;
