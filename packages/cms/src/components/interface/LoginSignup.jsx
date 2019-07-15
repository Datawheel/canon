import React, {Component} from "react";
import {Login, SignUp} from "@datawheel/canon-core";

export default class LoginSignup extends Component {
  constructor() {
    super();
    this.state = {
      tab: "login"
    };
  }

  render() {

    const {tab} = this.state;

    return (
      <div>
        <button onClick={() => this.setState({tab: "login"})} >Login</button>
        <button onClick={() => this.setState({tab: "signup"})} >Signup</button>
        {tab === "login" && <Login />}
        {tab === "signup" && <SignUp />}
      </div>
    );
  }
}
