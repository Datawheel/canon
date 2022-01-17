import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import {changePassword, resetPassword, validateReset} from "../actions/auth";
import {Intent} from "@blueprintjs/core";

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
      token: false
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const {location} = this.props.router;
    const {token} = location ? location.query : this.props;
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
    const {t, router} = this.props;
    const {password, passwordAgain} = this.state;
    const {token} = router.location.query;
    if (password !== passwordAgain) {
      const Toast = this.context.toast.current;
      Toast.show({icon: "error", intent: Intent.DANGER, message: t("SignUp.error.PasswordMatch")});
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
    const {auth, t, router} = this.props;
    const {email, submitted, token} = this.state;

    if (!token && auth.msg === RESET_TOKEN_SUCCESS) {
      this.setState({token: true});
    }
    else if (submitted && !auth.loading && (auth.msg || auth.error)) {
      const Toast = this.context.toast.current;
      if (auth.msg === RESET_PW_SUCCESS) {
        router.push(this.props.redirect);
      }
      else if (auth.msg === RESET_SEND_SUCCESS) {
        Toast.show({icon: "inbox", intent: Intent.SUCCESS, message: t("Reset.actions.RESET_SEND_SUCCESS", {email})});
        this.setState({submitted: false});
      }
      else if (auth.error === RESET_SEND_FAILURE) {
        Toast.show({icon: "error", intent: Intent.DANGER, message: t("Reset.actions.RESET_SEND_FAILURE", {email})});
        this.setState({submitted: false});
      }
      else if (auth.error === RESET_TOKEN_FAILURE) {
        Toast.show({icon: "error", intent: Intent.DANGER, message: t("Reset.actions.RESET_TOKEN_FAILURE")});
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
            <div className="bp3-input-group">
              <span className="bp3-icon bp3-icon-lock"></span>
              <input className="bp3-input" placeholder={ t("Reset.Password") } value={password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="3" />
            </div>
            <div className="bp3-input-group">
              <span className="bp3-icon bp3-icon-lock"></span>
              <input className="bp3-input" placeholder={ t("Reset.Confirm Password") } value={passwordAgain} type="password" name="passwordAgain" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="4" />
            </div>
            <button className="bp3-button bp3-fill" type="submit" tabIndex="5">{ t("Reset.button") }</button>
          </form>
        </div>
      );

    }
    else {

      return (
        <div>
          <form id="reset" onSubmit={this.resetPassword.bind(this)} className="reset-container">
            <div className="bp3-input-group">
              <span className="bp3-icon bp3-icon-envelope"></span>
              <input className="bp3-input" placeholder={ t("Reset.E-mail") } value={email} type="email" name="email" onChange={this.onChange} tabIndex="1" />
            </div>
            <button className="bp3-button bp3-fill" type="submit" tabIndex="5">{ t("Reset.button") }</button>
          </form>
        </div>
      );

    }

  }
}

Reset.defaultProps = {
  redirect: "/login"
};

Reset.contextTypes = {
  toast: PropTypes.object
};

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

Reset = withNamespaces()(Reset);
Reset = connect(mapStateToProps, mapDispatchToProps)(Reset);
export {Reset};
