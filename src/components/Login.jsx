import React, {Component} from "react";
import {connect} from "react-redux";
import {login, resetPassword} from "../actions/auth";
import {translate} from "react-i18next";
import {Intent, Toaster} from "@blueprintjs/core";

import facebookIcon from "../images/facebook-logo.svg";
import twitterIcon from "../images/twitter-logo.svg";
import instagramIcon from "../images/instagram-logo.svg";
import {
  RESET_SEND_FAILURE,
  RESET_SEND_SUCCESS,
  WRONG_PW
} from "../consts";

import "./Forms.css";

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      password: "",
      email: "",
      submitted: false,
      toast: typeof window !== "undefined" ? Toaster.create() : null
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  onSubmit(e) {
    e.preventDefault();
    const {redirect} = this.props;
    const {email, password} = this.state;
    this.props.login({email, password, redirect});
    this.setState({submitted: true});
  }

  componentDidUpdate() {

    const {auth, mailgun, t} = this.props;
    const {email, submitted, toast} = this.state;

    if (submitted && !auth.loading) {

      if (auth.error === WRONG_PW) {
        toast.show({
          action: mailgun ? {
            onClick: () => {
              this.setState({submitted: true});
              this.props.resetPassword(email);
            },
            text: t("Reset.button")
          } : null,
          iconName: "error",
          intent: Intent.DANGER,
          message: t("Login.error")
        });
        this.setState({submitted: false});
      }
      else if (auth.msg === RESET_SEND_SUCCESS) {
        toast.show({iconName: "inbox", intent: Intent.SUCCESS, message: t("Reset.send", {email})});
        this.setState({submitted: false});
      }
      else if (auth.error === RESET_SEND_FAILURE) {
        toast.show({iconName: "error", intent: Intent.DANGER, message: t("Reset.fail")});
        this.setState({submitted: false});
      }
      else if (!auth.error) {
        toast.show({iconName: "endorsed", intent: Intent.SUCCESS, message: t("Login.success")});
      }
    }

  }

  render() {

    const {social, t} = this.props;
    const {email, password} = this.state;

    return (
      <div>
        <form id="login" onSubmit={this.onSubmit.bind(this)} className="login-container">
          <div className="pt-input-group">
            <span className="pt-icon pt-icon-envelope"></span>
            <input className="pt-input" placeholder={ t("Login.E-mail") } value={email} type="email" name="email" onChange={this.onChange} tabIndex="1" />
          </div>
          <div className="pt-input-group">
            <span className="pt-icon pt-icon-lock"></span>
            <input className="pt-input" placeholder={ t("Login.Password") } value={password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="3" />
          </div>
          <button className="pt-button pt-fill" type="submit" tabIndex="5">{ t("Login.Login") }</button>
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

Login.defaultProps = {
  redirect: "/"
};

const mapStateToProps = state => ({
  auth: state.auth,
  mailgun: state.mailgun,
  social: state.social
});

const mapDispatchToProps = dispatch => ({
  login: userData => {
    dispatch(login(userData));
  },
  resetPassword: email => {
    dispatch(resetPassword(email));
  }
});

Login = translate()(Login);
Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export {Login};
