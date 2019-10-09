import React, {Component} from "react";
import {LoginForm} from "./LoginForm";
import {SignupForm} from "./SignupForm";
import "./AuthForm.css";

export default class AuthForm extends Component {
  constructor() {
    super();
    this.state = {
      mode: "login"
    };
  }

  toggleMode(currentMode) {
    this.setState({
      mode: currentMode === "login" ? "signup" : "login"
    });
  }

  render() {
    const {mode} = this.state;
    const {auth, error, redirect} = this.props;

    let modeTitle = "Log in";
    let modeSwitchPrompt = "Don't have an account yet? ";
    let modeSwitchLink = "Sign up";

    if (mode === "signup") {
      modeTitle = "Sign up";
      modeSwitchPrompt = "Already have an account? ";
      modeSwitchLink = "Log in";
    }

    return (
      <div className="cms cms-auth-page">
        <div className="cms-auth-form">
          <div className="cms-auth-form-inner">
            {error
              // render error message
              ? <React.Fragment>
                <h1 className="cms-auth-form-title">Error: insufficient permissions</h1>
                <p className="cms-auth-form-paragraph u-font-sm u-margin-bottom-sm">
                  User <strong>{auth.user.username}</strong> is currently not allowed to access the CMS. Please contact administrator.
                </p>
                <p className="cms-auth-form-paragraph u-margin-bottom-off">
                  <a className="cms-auth-form-link" href="/auth/logout">Log Out</a>
                </p>
              </React.Fragment>
              // render the form
              : <React.Fragment>
                <h1 className="cms-auth-form-title">{modeTitle}</h1>

                {mode === "login" ? <LoginForm redirect={redirect}/> : <SignupForm redirect={redirect}/>}

                <p className="cms-auth-form-paragraph u-font-xs u-margin-top-md u-margin-bottom-off">
                  {modeSwitchPrompt}
                  <button className="cms-auth-form-switcher" onClick={() => this.toggleMode(mode)}>
                    {modeSwitchLink}
                  </button>
                </p>
              </React.Fragment>
            }
          </div>
        </div>
      </div>
    );
  }
}
