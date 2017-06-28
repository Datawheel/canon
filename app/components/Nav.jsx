import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import "./Nav.css";

class Nav extends Component {

  render() {
    const {user} = this.props.auth;

    return (
      <nav className="nav">
        <Link className="logo" to="/">Canonical Design</Link>
        <Link className="link" to="/profile/040AF00182">Profile</Link>
        { user
        ? <a className="user-link" href="/auth/logout">Logout</a>
        : <div className="user-info">
            <Link className="user-link" to="/login">Login</Link>
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
