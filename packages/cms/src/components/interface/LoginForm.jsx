import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import {login, resetPassword} from "@datawheel/canon-core/src/actions/auth";
import {Intent} from "@blueprintjs/core";
import {SocialButtons} from "@datawheel/canon-core/src/components/SocialButtons";

import Button from "../fields/Button";
import TextInput from "../fields/TextInput";

import {
  RESET_SEND_FAILURE,
  RESET_SEND_SUCCESS,
  WRONG_PW
} from "@datawheel/canon-core/src/consts";

// import "./Forms.css";

class LoginForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      password: "",
      email: "",
      submitted: false
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
    const {email, submitted} = this.state;
    const Toast = this.context.toast.current;

    if (submitted && !auth.loading) {

      if (auth.error === WRONG_PW) {
        Toast.show({
          action: mailgun ? {
            onClick: () => {
              this.setState({submitted: true});
              this.props.resetPassword(email);
            },
            text: t("Reset.button")
          } : null,
          icon: "error",
          intent: Intent.DANGER,
          message: t("Login.error")
        });
      }
      else if (auth.msg === RESET_SEND_SUCCESS) {
        Toast.show({icon: "inbox", intent: Intent.SUCCESS, message: t("Reset.actions.RESET_SEND_SUCCESS", {email})});
      }
      else if (auth.error === RESET_SEND_FAILURE) {
        Toast.show({icon: "error", intent: Intent.DANGER, message: t("Reset.actions.RESET_SEND_FAILURE")});
      }
      else if (!auth.error) {
        Toast.show({icon: "endorsed", intent: Intent.SUCCESS, message: t("Login.success")});
      }
      this.setState({submitted: false});
    }

  }

  render() {

    const {social, t} = this.props;
    const {email, password} = this.state;

    return (
      <form onSubmit={this.onSubmit.bind(this)} className="login-container">
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

        <Button
          className="cms-login-submit-button u-margin-top-md"
          namespace="cms"
          fontSize="md"
          fill
          type="submit"
        >
          log in
        </Button>

        {social ? <SocialButtons social={social} /> : ""}
      </form>
    );

  }
}

LoginForm.defaultProps = {
  redirect: "/"
};

LoginForm.contextTypes = {
  toast: PropTypes.object
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

LoginForm = withNamespaces()(LoginForm);
LoginForm = connect(mapStateToProps, mapDispatchToProps)(LoginForm);
export {LoginForm};
