import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import {signup} from "../actions/auth";
import {Intent} from "@blueprintjs/core";
import {SocialButtons} from "./SocialButtons";

import {SIGNUP_EXISTS} from "../consts";

import "./Forms.css";

class SignUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      agreedToTerms: false,
      error: null,
      password: "",
      passwordAgain: "",
      email: null,
      submitted: false
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const val = e.target.name === "agreedToTerms" ? e.target.checked : e.target.value;
    this.setState({[e.target.name]: val});
  }

  onSubmit(e) {
    e.preventDefault();
    const {legal, redirect, t} = this.props;
    const {agreedToTerms, email, password, passwordAgain, username} = this.state;

    if (password !== passwordAgain) {
      this.setState({error: {icon: "lock", message: t("SignUp.error.PasswordMatch")}});
    }
    else if (!username || !email || !password) {
      this.setState({error: {icon: "id-number", message: t("SignUp.error.IncompleteFields")}});
    }
    else if ((legal.privacy || legal.terms) && !agreedToTerms) {
      this.setState({error: {icon: "saved", message: t("SignUp.error.TermsAgree")}});
    }
    else {
      this.props.signup({username, email, password, redirect});
      this.setState({submitted: true});
    }

  }

  componentDidUpdate() {
    const {auth, t} = this.props;
    const {error, submitted} = this.state;

    if (submitted && !auth.loading) {
      if (auth.error === SIGNUP_EXISTS) {
        this.showToast(t("SignUp.error.Exists"), "blocked-person", Intent.WARNING);
      }
      else if (!auth.error) {
        this.showToast(t("SignUp.success"), "endorsed", Intent.SUCCESS);
      }
      this.setState({submitted: false});
    }
    else if (error) {
      this.showToast(error.message, error.icon, error.intent);
      this.setState({error: false});
    }

  }

  showToast(message, icon = "lock", intent = Intent.DANGER) {
    const Toast = this.context.toast.current;
    Toast.show({icon, intent, message});
  }

  render() {
    const {auth, legal, social, t} = this.props;
    const {agreedToTerms} = this.state;
    const email = this.state.email === null ? auth.error && auth.error.email ? auth.error.email : "" : this.state.email;

    return (
      <div>
        <form id="signup" onSubmit={this.onSubmit.bind(this)} className="login-container">
          <div className="bp3-input-group">
            <span className="bp3-icon bp3-icon-envelope"></span>
            <input className="bp3-input" placeholder={ t("SignUp.E-mail") } value={email} type="email" name="email" onChange={this.onChange} tabIndex="1" />
          </div>
          <div className="bp3-input-group">
            <span className="bp3-icon bp3-icon-user"></span>
            <input className="bp3-input" placeholder={ t("SignUp.Username") } value={this.state.username} type="text" name="username" onFocus={this.onChange} onChange={this.onChange} tabIndex="2" />
          </div>
          <div className="bp3-input-group">
            <span className="bp3-icon bp3-icon-lock"></span>
            <input className="bp3-input" placeholder={ t("SignUp.Password") } value={this.state.password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="3" />
          </div>
          <div className="bp3-input-group">
            <span className="bp3-icon bp3-icon-lock"></span>
            <input className="bp3-input" placeholder={ t("SignUp.Confirm Password") } value={this.state.passwordAgain} type="password" name="passwordAgain" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="4" />
          </div>
          { legal.privacy || legal.terms
            ? <label className="bp3-control bp3-checkbox" htmlFor="ppcbox">
              <input type="checkbox" id="ppcbox" name="agreedToTerms" checked={agreedToTerms} onChange={this.onChange} />
              <span className="bp3-control-indicator"></span>
              <span dangerouslySetInnerHTML={{__html: legal.privacy && legal.terms ? t("SignUp.PrivacyTermsText") : legal.privacy ? t("SignUp.PrivacyText") : t("SignUp.TermsText"), legal}}></span>
            </label>
            : null }
          <button type="submit" className="bp3-button bp3-fill" tabIndex="5">{ t("SignUp.Sign Up") }</button>
        </form>
        <SocialButtons social={social} />
      </div>
    );

  }
}

SignUp.defaultProps = {
  redirect: "/"
};

SignUp.contextTypes = {
  toast: PropTypes.object
};

const mapStateToProps = state => ({
  auth: state.auth,
  legal: state.legal,
  social: state.social
});

const mapDispatchToProps = dispatch => ({
  signup: userData => {
    dispatch(signup(userData));
  }
});

SignUp = withNamespaces()(SignUp);
SignUp = connect(mapStateToProps, mapDispatchToProps)(SignUp);
export {SignUp};
