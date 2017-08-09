import React, {Component} from "react";
import {connect} from "react-redux";
import {login} from "../actions/auth";
import {translate} from "react-i18next";

import facebookIcon from "../images/facebook-logo.svg";
import twitterIcon from "../images/twitter-logo.svg";
import instagramIcon from "../images/instagram-logo.svg";

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
    const {auth, social, t} = this.props;
    const {error} = this.state;
    const email = this.state.email === null ? auth.error && auth.error.email ? auth.error.email : "" : this.state.email;

    const displayError = auth.error ? auth.error.msg : error;

    return (
      <div>
        <form id="login" ref="emailForm" onSubmit={this.onSubmit.bind(this)} className="login-container">
          <div className="pt-input-group">
            <span className="pt-icon pt-icon-envelope"></span>
            <input className="pt-input" placeholder={ t("Login.E-mail") } value={email} type="email" name="email" ref="email" onChange={this.onChange} tabIndex="1" />
          </div>
          <div className="pt-input-group">
            <span className="pt-icon pt-icon-lock"></span>
            <input className="pt-input" placeholder={ t("Login.Password") } value={this.state.password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="3" />
          </div>
          <button className="pt-button pt-fill" type="submit" tabIndex="5">{ t("Login.Login") }</button>
          { displayError ? <div className="pt-callout pt-intent-danger">{ displayError }</div> : null }
        </form>
        { social.length
        ? <div id="socials">
          { social.includes("facebook") ? <a href="/auth/facebook" className="pt-button facebook"><img className="icon" src={facebookIcon} /><span>{ t("Login.Facebook") }</span></a> : null }
          { social.includes("twitter") ? <a href="/auth/twitter" className="pt-button twitter"><img className="icon" src={twitterIcon} /><span>{ t("Login.Twitter") }</span></a> : null }
          { social.includes("instagram") ? <a href="/auth/instagram" className="pt-button instagram"><img className="icon" src={instagramIcon} /><span>{ t("Login.Instagram") }</span></a> : null }
          </div>
        : null }
      </div>
    );

  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  social: state.social
});

const mapDispatchToProps = dispatch => ({
  login: userData => {
    dispatch(login(userData));
  }
});

Login = translate()(Login);
Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export {Login};
