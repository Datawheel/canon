import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import "./Nav.css";

class Nav extends Component {

  render() {
    return (
      <nav className="nav">
        <Link className="logo" to="/">Canonical Design</Link>
      </nav>
    );
  }
}

export default connect(() => ({}))(Nav);
