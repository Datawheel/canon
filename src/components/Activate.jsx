import React, {Component} from "react";
import {connect} from "react-redux";
import {sendActivation, validateActivation} from "../actions/auth";
import {translate} from "react-i18next";
import {Intent, Toaster} from "@blueprintjs/core";

import {
  ACTIVATE_SEND_FAILURE,
  ACTIVATE_SEND_SUCCESS,
  ACTIVATE_TOKEN_FAILURE,
  ACTIVATE_TOKEN_SUCCESS,
  LOGIN_SUCCESS
} from "../consts";

class Activate extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activated: undefined,
      submitted: false,
      toast: typeof window !== "undefined" ? Toaster.create() : null,
      token: false
    };
  }

  componentDidMount() {
    const {email, token} = this.props.location ? this.props.location.query : this.props;
    if (token) {
      this.props.validateActivation(email, token);
      this.setState({submitted: true});
    }
  }

  sendActivation(e) {
    e.preventDefault();
    const {email} = this.props.auth.user;
    this.props.sendActivation(email);
    this.setState({submitted: true});
  }

  componentDidUpdate() {

    const {auth, t} = this.props;
    const {activated, submitted, toast} = this.state;

    if (!activated && auth.msg === ACTIVATE_TOKEN_SUCCESS) {
      this.setState({activated: true});
    }
    else if (activated === undefined && auth.msg === LOGIN_SUCCESS) {
      this.setState({activated: auth.user.activated});
    }
    else if (submitted && !auth.loading && (auth.msg || auth.error)) {
      if (auth.msg === ACTIVATE_SEND_SUCCESS) {
        toast.show({iconName: "inbox", intent: Intent.SUCCESS, message: t("Activate.actions.ACTIVATE_SEND_SUCCESS", {email: auth.user.email})});
        this.setState({submitted: false});
      }
      else if (auth.error === ACTIVATE_SEND_FAILURE) {
        toast.show({iconName: "error", intent: Intent.DANGER, message: t("Activate.actions.ACTIVATE_SEND_FAILURE", {email: auth.user.email})});
        this.setState({submitted: false});
      }
      else if (auth.error === ACTIVATE_TOKEN_FAILURE) {
        toast.show({iconName: "error", intent: Intent.DANGER, message: t("Activate.actions.ACTIVATE_TOKEN_FAILURE")});
        this.setState({submitted: false});
      }
    }

  }

  render() {

    const {auth, hidden, t} = this.props;

    if (!auth.user || hidden) return null;

    const {activated} = this.state;

    if (activated === undefined) {

      return (
        <div className="pt-callout">
          <h5>E-mail:</h5>
        </div>
      );

    }
    else if (activated) {

      return (
        <div className="pt-callout pt-intent-success">
          <h5>E-mail: Verified</h5>
          <button className="pt-button pt-fill pt-disabled" disabled>{ t("Activate.button") }</button>
        </div>
      );

    }
    else {

      return (
        <div className="pt-callout pt-intent-danger">
          <h5>E-mail: Not Verified</h5>
          <button className="pt-button pt-fill pt-intent-danger" onClick={this.sendActivation.bind(this)}>{ t("Activate.button") }</button>
        </div>
      );

    }

  }
}

Activate.defaultProps = {
  hidden: false
};

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  sendActivation: email => {
    dispatch(sendActivation(email));
  },
  validateActivation: (email, token) => {
    dispatch(validateActivation(email, token));
  }
});

Activate = translate()(Activate);
Activate = connect(mapStateToProps, mapDispatchToProps)(Activate);
export {Activate};
