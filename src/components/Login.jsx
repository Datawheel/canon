import React, {Component} from "react";
import {connect} from "react-redux";
import {login} from "../actions/auth";

import "./Forms.css";

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      password: "",
      email: null
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  onSubmit(e) {

    e.preventDefault();
    const {password} = this.state;
    const email = this.state.email === this.refs.email.value ? this.state.email : this.refs.email.value;

    this.props.login({email, password});

  }

  render() {
    const {auth} = this.props;
    const {error} = this.state;
    const email = this.state.email === null ? auth.error && auth.error.email ? auth.error.email : "" : this.state.email;

    const displayError = auth.error ? auth.error.msg : error;

    return (
      <form id="em-login" ref="emailForm" onSubmit={this.onSubmit.bind(this)} className="login-container">
        <div className="pt-input-group">
          <span className="pt-icon pt-icon-envelope"></span>
          <input className="pt-input" placeholder="E-mail" value={email} type="email" name="email" ref="email" onChange={this.onChange} tabIndex="1" />
        </div>
        <div className="pt-input-group">
          <span className="pt-icon pt-icon-lock"></span>
          <input className="pt-input" placeholder="Password" value={this.state.password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="3" />
        </div>
        <button className="pt-button pt-fill" type="submit" tabIndex="5">Login</button>
        { displayError ? <div className="pt-callout pt-intent-danger">{ displayError }</div> : null }
      </form>
    );

  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  login: userData => {
    dispatch(login(userData));
  }
});

// export default (Login);
Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export {Login};
