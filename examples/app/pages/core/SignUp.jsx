import {SignUp} from "@datawheel/canon-core";
import React, {Component} from "react";
import {connect} from "react-redux";

class SignUpWrapper extends Component {

  render() {
    // console.log("\nUSER\n", this.props.auth);
    return <div>
      <h1>Core Package</h1>
      <h2>SignUp</h2>
      <p>TO-DO</p>
      <SignUp redirect={false} />
    </div>;

  }
}

export default connect(state => ({
  auth: state.auth
}))(SignUpWrapper);
