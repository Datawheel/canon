import {Login} from "@datawheel/canon-core";
import React, {Component} from "react";
import {connect} from "react-redux";

class LoginWrapper extends Component {

  render() {
    console.log("\nUSER\n", this.props.auth);
    return <div>
      <Login redirect={false} />
      <button onClick={() => this.props.router.push("/#anchorTest")}>jump to other place</button>
    </div>;

  }
}

export default connect(state => ({
  auth: state.auth
}))(LoginWrapper);
