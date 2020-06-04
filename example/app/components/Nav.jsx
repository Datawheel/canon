import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import "./Nav.css";

import Icon from "./icon-save.svg";

const userLinks = "<a class='user-link' data-refresh='true' href='/login'>Login</a><a class='user-link' href='/reset'>Reset</a><a class='user-link' href='/signup'>Sign Up</a><a class='user-link' href='/no/route/here/please/stop'>No Route</a><a class='user-link' target='_blank' href='http://www.google.com'>Google</a>";

class Nav extends Component {

  render() {
    const {user} = this.props.auth;

    return (
      <nav className="nav">
        <Link className="logo" to="/"><img src={Icon} /> Canonical Design</Link>
        <a className="link" href="/profile/040AF00182">Profile</a>
        <Link className="link" to="/profile">Random Profile</Link>
        { user
          ? <div className="user-info">
            { user.role >= 2 ? <Link className="user-link" to="/admin">Admin</Link> : null }
            <a className="user-link" href="/auth/logout">Logout</a>
          </div>
          : <div className="user-info" dangerouslySetInnerHTML={{__html: userLinks}}></div>
        }
      </nav>
    );

  }
}

export default connect(state => ({
  auth: state.auth
}), {})(Nav);
