import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import "./Nav.css";

import Icon from "./icon-save.svg";

class Nav extends Component {

  render() {
    const {user} = this.props.auth;

    return (
      <nav className="nav">
        <Link className="logo" to="/"><img src={Icon} /> Canonical Design</Link>
        <Link className="link" to="/profile/040AF00182">Profile</Link>
        <Link className="link" to="/profile">Random Profile</Link>
        { user
          ? <div className="user-info">
            { user.role >= 2 ? <Link className="user-link" to="/admin">Admin</Link> : null }
            <a className="user-link" href="/auth/logout">Logout</a>
          </div>
          : <div className="user-info">
            <Link className="user-link" to="/login">Login</Link>
            <Link className="user-link" to="/reset">Reset</Link>
            <Link className="user-link" to="/signup">Sign Up</Link>
          </div>
        }
      </nav>
    );

  }
}

export default connect(state => ({
  auth: state.auth
}), {})(Nav);
