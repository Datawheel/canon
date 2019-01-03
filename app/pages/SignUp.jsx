import React, {Component} from "react";
import {connect} from "react-redux";
import {SignUp} from "../../src";

class SignUpWrapper extends Component {

  render() {
    // console.log("\nUSER\n", this.props.auth);
    return <SignUp redirect={false} />;

  }
}

export default connect(state => ({
  auth: state.auth
}))(SignUpWrapper);
