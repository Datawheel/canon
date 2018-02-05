import React, {Component} from "react";
import {connect} from "react-redux";
import {Login} from "../../src";

class LoginWrapper extends Component {

  render() {
    console.log("\nUSER\n", this.props.auth);
    return <Login redirect={false} />;

  }
}

export default connect(state => ({
  auth: state.auth
}))(LoginWrapper);
