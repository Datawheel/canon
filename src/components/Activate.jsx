import React, {Component} from "react";
import PropTypes from "prop-types";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import {isAuthenticated, sendActivation, validateActivation} from "../actions/auth";
import {Intent} from "@blueprintjs/core";

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
    const {auth} = this.props;
    this.state = {
      activated: auth.user ? auth.user.activated : undefined,
      submitted: false,
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
    const {activated, submitted} = this.state;
    const Toast = this.context.toast.current;

    if (!activated && auth.msg === ACTIVATE_TOKEN_SUCCESS) {
      this.props.isAuthenticated();
      this.setState({activated: true});
    }
    else if (activated === undefined && auth.msg === LOGIN_SUCCESS) {
      this.setState({activated: auth.user.activated});
    }
    else if (submitted && !auth.loading && (auth.msg || auth.error)) {
      if (auth.msg === ACTIVATE_SEND_SUCCESS) {
        Toast.show({icon: "inbox", intent: Intent.SUCCESS, message: t("Activate.actions.ACTIVATE_SEND_SUCCESS", {email: auth.user.email})});
        this.setState({submitted: false});
      }
      else if (auth.error === ACTIVATE_SEND_FAILURE) {
        Toast.show({icon: "error", intent: Intent.DANGER, message: t("Activate.actions.ACTIVATE_SEND_FAILURE", {email: auth.user.email})});
        this.setState({submitted: false});
      }
      else if (auth.error === ACTIVATE_TOKEN_FAILURE) {
        Toast.show({icon: "error", intent: Intent.DANGER, message: t("Activate.actions.ACTIVATE_TOKEN_FAILURE")});
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
        <div className="bp3-callout">
          <h5>E-mail:</h5>
        </div>
      );

    }
    else if (activated) {

      return (
        <div className="bp3-callout bp3-intent-success">
          <h5>E-mail: Verified</h5>
          <button className="bp3-button bp3-fill bp3-disabled" disabled>{ t("Activate.button") }</button>
        </div>
      );

    }
    else {

      return (
        <div className="bp3-callout bp3-intent-danger">
          <h5>E-mail: Not Verified</h5>
          <button className="bp3-button bp3-fill bp3-intent-danger" onClick={this.sendActivation.bind(this)}>{ t("Activate.button") }</button>
        </div>
      );

    }

  }
}

Activate.defaultProps = {
  hidden: false
};

Activate.contextTypes = {
  toast: PropTypes.object
};

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  },
  sendActivation: email => {
    dispatch(sendActivation(email));
  },
  validateActivation: (email, token) => {
    dispatch(validateActivation(email, token));
  }
});

Activate = withNamespaces()(Activate);
Activate = connect(mapStateToProps, mapDispatchToProps)(Activate);
export {Activate};
