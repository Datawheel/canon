import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import {login, resetPassword} from "@datawheel/canon-core/src/actions/auth";
import {Icon, Intent} from "@blueprintjs/core";
import {SocialButtons} from "@datawheel/canon-core/src/components/SocialButtons";

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
      <div>
        <form id="login" onSubmit={this.onSubmit.bind(this)} className="login-container">
          <div className="bp3-input-group">
            <Icon icon="envelope" />
            <input className="bp3-input" placeholder={ t("Login.E-mail") } value={email} type="email" name="email" onChange={this.onChange} tabIndex="1" />
          </div>
          <div className="bp3-input-group">
            <Icon icon="lock" />
            <input className="bp3-input" placeholder={ t("Login.Password") } value={password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} autoComplete="Off" tabIndex="3" />
          </div>
          <button className="bp3-button bp3-fill" type="submit" tabIndex="5">{ t("Login.Login") }</button>
        </form>
        <SocialButtons social={social} />
      </div>
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
