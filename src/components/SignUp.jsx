import React, {Component} from "react";
import {connect} from "react-redux";
import {signup} from "../actions/auth";

import "./Forms.css";

class SignUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      agreedToTerms: false,
      error: null,
      password: "",
      passwordAgain: "",
      email: null
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const val = e.target.name === "agreedToTerms" ? e.target.checked : e.target.value;
    this.setState({[e.target.name]: val});
  }

  onSubmit(e) {
    e.preventDefault();
    const {username, password, passwordAgain, agreedToTerms} = this.state;
    const email = this.state.email === this.refs.email.value ? this.state.email : this.refs.email.value;

    if (password !== passwordAgain) {
      this.setState({error: "Passwords don't match."});
      return;
    }
    if (!username || !email || !password) {
      this.setState({error: "Please set all fields."});
      return;
    }
    if (!agreedToTerms) {
      this.setState({error: "Must agree to terms to continue."});
      return;
    }
    this.setState({error: null});
    this.props.signup({username, email, password});

  }

  render() {
    const {auth} = this.props;
    const {agreedToTerms, error} = this.state;
    const email = this.state.email === null ? auth.error && auth.error.email ? auth.error.email : "" : this.state.email;

    const displayError = auth.error ? auth.error.msg : error;

    return (
      <form id="em-login" ref="emailForm" onSubmit={this.onSubmit.bind(this)} className="login-container">
        <div className="pt-input-group">
          <span className="pt-icon pt-icon-envelope"></span>
          <input className="pt-input" placeholder="E-mail" value={email} type="email" name="email" ref="email" onChange={this.onChange} tabIndex="1" />
        </div>
        <div className="pt-input-group">
          <span className="pt-icon pt-icon-user"></span>
          <input className="pt-input" placeholder="Username" value={this.state.username} type="text" name="username" onFocus={this.onChange} onChange={this.onChange} tabIndex="2" />
        </div>
        <div className="pt-input-group">
          <span className="pt-icon pt-icon-lock"></span>
          <input className="pt-input" placeholder="Password" value={this.state.password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="3" />
        </div>
        <div className="pt-input-group">
          <span className="pt-icon pt-icon-lock"></span>
          <input className="pt-input" placeholder="Confirm Password" value={this.state.passwordAgain} type="password" name="passwordAgain" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="4" />
        </div>
        <label className="pt-control pt-checkbox" htmlFor="ppcbox" ref="agreedToTerms">
          <input type="checkbox" id="ppcbox" name="agreedToTerms" checked={agreedToTerms} onChange={this.onChange} />
          <span className="pt-control-indicator"></span>
          By checking this box, you agree to our Privacy Policy
        </label>
        <button type="submit" className="pt-button pt-fill" tabIndex="5">Sign up</button>
        { displayError ? <div className="pt-callout pt-intent-danger">{ displayError }</div> : null }
      </form>
    );

  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  signup: userData => {
    dispatch(signup(userData));
  }
});

SignUp = connect(mapStateToProps, mapDispatchToProps)(SignUp);
export {SignUp};
