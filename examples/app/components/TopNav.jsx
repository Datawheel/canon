import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {hot} from "react-hot-loader/root";
import {Alignment, Icon, Navbar} from "@blueprintjs/core";

const userLinks = "<a class='user-link' data-refresh='true' href='/login'>Login</a><a class='user-link' href='/reset'>Reset</a><a class='user-link' href='/signup'>Sign Up</a><a class='user-link' href='/no/route/here/please/stop'>No Route</a><a class='user-link' target='_blank' href='http://www.google.com'>Google</a>";

class Nav extends Component {

  render() {
    const {user} = this.props.auth;

    return (
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            <Link className="logo" to="/"><Icon icon="full-circle" /> Canon</Link>
          </Navbar.Heading>
        </Navbar.Group>
        {/* <Navbar.Group align={Alignment.RIGHT}>
          { user
            ? <div className="user-info">
              { user.role >= 2 ? <Link className="user-link" to="/admin">Admin</Link> : null }
              <a className="user-link" href="/auth/logout">Logout</a>
            </div>
            : <div className="user-info" dangerouslySetInnerHTML={{__html: userLinks}}></div>
          }
        </Navbar.Group> */}
      </Navbar>
    );

  }
}

export default connect(state => ({
  auth: state.auth
}), {})(hot(Nav));
