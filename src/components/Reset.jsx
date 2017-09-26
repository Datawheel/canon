import React, {Component} from "react";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import {changePassword, resetPassword, validateReset} from "../actions/auth";
import {translate} from "react-i18next";
import {Intent, Toaster} from "@blueprintjs/core";

import {
  RESET_PW_SUCCESS,
  RESET_SEND_FAILURE,
  RESET_SEND_SUCCESS,
  RESET_TOKEN_FAILURE,
  RESET_TOKEN_SUCCESS
} from "../consts";

import "./Forms.css";

class Reset extends Component {

  constructor(props) {
    super(props);
    this.state = {
      password: "",
      email: "",
      submitted: false,
      toast: typeof window !== "undefined" ? Toaster.create() : null,
      token: false
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const {token} = this.props.location ? this.props.location.query : this.props;
    if (token) {
      this.props.validateReset(token);
      this.setState({submitted: true});
    }
  }

  onChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  changePassword(e) {
    e.preventDefault();
    const {t} = this.props;
    const {password, passwordAgain, toast} = this.state;
    const {token} = this.props.location.query;
    if (password !== passwordAgain) {
      toast.show({iconName: "error", intent: Intent.DANGER, message: t("SignUp.error.PasswordMatch")});
      return;
    }
    this.props.changePassword(token, password);
  }

  resetPassword(e) {
    e.preventDefault();
    const {email} = this.state;
    this.props.resetPassword(email);
    this.setState({submitted: true});
  }

  componentDidUpdate() {

    const {auth, t} = this.props;
    const {email, submitted, toast, token} = this.state;

    if (!token && auth.msg === RESET_TOKEN_SUCCESS) {
      this.setState({token: true});
    }
    else if (submitted && !auth.loading && (auth.msg || auth.error)) {
      if (auth.msg === RESET_PW_SUCCESS) {
        browserHistory.push("/login");
      }
      else if (auth.msg === RESET_SEND_SUCCESS) {
        toast.show({iconName: "inbox", intent: Intent.SUCCESS, message: t("Reset.actions.RESET_SEND_SUCCESS", {email})});
        this.setState({submitted: false});
      }
      else if (auth.error === RESET_SEND_FAILURE) {
        toast.show({iconName: "error", intent: Intent.DANGER, message: t("Reset.actions.RESET_SEND_FAILURE", {email})});
        this.setState({submitted: false});
      }
      else if (auth.error === RESET_TOKEN_FAILURE) {
        toast.show({iconName: "error", intent: Intent.DANGER, message: t("Reset.actions.RESET_TOKEN_FAILURE")});
        this.setState({submitted: false});
      }
    }

  }

  render() {

    const {t} = this.props;
    const {email, password, passwordAgain, token} = this.state;

    if (token) {

      return (
        <div>
          <form id="reset" onSubmit={this.changePassword.bind(this)} className="reset-container">
            <div className="pt-input-group">
              <span className="pt-icon pt-icon-lock"></span>
              <input className="pt-input" placeholder={ t("Reset.Password") } value={password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="3" />
            </div>
            <div className="pt-input-group">
              <span className="pt-icon pt-icon-lock"></span>
              <input className="pt-input" placeholder={ t("Reset.Confirm Password") } value={passwordAgain} type="password" name="passwordAgain" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="4" />
            </div>
            <button className="pt-button pt-fill" type="submit" tabIndex="5">{ t("Reset.button") }</button>
          </form>
        </div>
      );

    }
    else {

      return (
        <div>
          <form id="reset" onSubmit={this.resetPassword.bind(this)} className="reset-container">
            <div className="pt-input-group">
              <span className="pt-icon pt-icon-envelope"></span>
              <input className="pt-input" placeholder={ t("Reset.E-mail") } value={email} type="email" name="email" onChange={this.onChange} tabIndex="1" />
            </div>
            <button className="pt-button pt-fill" type="submit" tabIndex="5">{ t("Reset.button") }</button>
          </form>
        </div>
      );

    }

  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  changePassword: (token, password) => {
    dispatch(changePassword(token, password));
  },
  resetPassword: email => {
    dispatch(resetPassword(email));
  },
  validateReset: token => {
    dispatch(validateReset(token));
  }
});

Reset = translate()(Reset);
Reset = connect(mapStateToProps, mapDispatchToProps)(Reset);
export {Reset};
