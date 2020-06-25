import {Login} from "@datawheel/canon-core";
import React, {Component} from "react";
import {connect} from "react-redux";

class LoginWrapper extends Component {

  render() {
    console.log("\nUSER\n", this.props.auth);
    return <div>
      <h1>Core Package</h1>
      <h2>Login</h2>
      <p>TO-DO</p>
      <Login redirect={false} />
      <button onClick={() => this.props.router.push("/#anchorTest")}>jump to other place</button>
    </div>;

  }
}

export default connect(state => ({
  auth: state.auth
}))(LoginWrapper);
