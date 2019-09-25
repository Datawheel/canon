import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import {signup} from "@datawheel/canon-core/src/actions/auth";
import {Intent} from "@blueprintjs/core";
import {SocialButtons} from "@datawheel/canon-core/src/components/SocialButtons";

import Button from "../fields/Button";
import TextInput from "../fields/TextInput";

import {SIGNUP_EXISTS} from "@datawheel/canon-core/src/consts";

class SignupForm extends Component {

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
    const {agreedToTerms, email, password, username} = this.state;

    // if (password !== this.state.passwordAgain) {
    //   this.setState({error: {icon: "lock", message: t("SignUp.error.PasswordMatch")}});
    // }
    if (!username || !email || !password) {
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
    const {agreedToTerms, username, password} = this.state;
    const email = this.state.email === null ? auth.error && auth.error.email ? auth.error.email : "" : this.state.email;

    return (
      <form onSubmit={this.onSubmit.bind(this)} className="login-container" autoComplete="off">
        <TextInput
          label="Email address"
          namespace="cms"
          fontSize="md"
          labelFontSize="xs"
          icon="envelope"
          value={email}
          name="email"
          onChange={this.onChange}
          autoFocus
        />

        <TextInput
          label="Username"
          namespace="cms"
          fontSize="md"
          labelFontSize="xs"
          icon="user"
          value={username}
          name="username"
          onChange={this.onChange}
        />

        <TextInput
          label="Password"
          namespace="cms"
          fontSize="md"
          labelFontSize="xs"
          icon="lock"
          value={password}
          name="password"
          type="password"
          onChange={this.onChange}
        />

        {/* <TextInput
          label={t("SignUp.Confirm Password")}
          namespace="cms"
          fontSize="md"
          labelFontSize="xs"
          icon="lock"
          value={this.state.passwordAgain}
          name="passwordAgain"
          onChange={this.onChange}
        /> */}

        { legal.privacy || legal.terms
          ? <label className="bp3-control bp3-checkbox" htmlFor="ppcbox">
            <input type="checkbox" id="ppcbox" name="agreedToTerms" checked={agreedToTerms} onChange={this.onChange} />
            <span className="bp3-control-indicator"></span>
            <span dangerouslySetInnerHTML={{__html: legal.privacy && legal.terms ? t("SignUp.PrivacyTermsText") : legal.privacy ? t("SignUp.PrivacyText") : t("SignUp.TermsText"), legal}}></span>
          </label> : ""
        }

        <Button
          className="cms-login-submit-button u-margin-top-md"
          namespace="cms"
          fontSize="md"
          block
          type="submit"
        >
          sign up
        </Button>

        {social ? <SocialButtons social={social} /> : ""}
      </form>
    );
  }
}

SignupForm.defaultProps = {
  redirect: "/"
};

SignupForm.contextTypes = {
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

SignupForm = withNamespaces()(SignupForm);
SignupForm = connect(mapStateToProps, mapDispatchToProps)(SignupForm);
export {SignupForm};
