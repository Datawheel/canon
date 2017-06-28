import React, {Component} from "react";
import {connect} from "react-redux";
import {signup} from "../actions/auth";

class SignUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      agreedToTerms: false,
      error: null,
      password: "",
      passwordAgain: "",
      email: null
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const val = e.target.name === "agreedToTerms" ? e.target.checked : e.target.value;
    this.setState({[e.target.name]: val});
  }

  onSubmit(e) {
    e.preventDefault();
    const {username, password, passwordAgain, agreedToTerms} = this.state;
    const email = this.state.email === this.refs.email.value ? this.state.email : this.refs.email.value;

    if (password !== passwordAgain) {
      this.setState({error: "Passwords don't match."});
      return;
    }
    if (!username || !email || !password) {
      this.setState({error: "Please set all fields."});
      return;
    }
    if (!agreedToTerms) {
      this.setState({error: "Must agree to terms to continue."});
      return;
    }
    this.setState({error: null});
    this.props.signup({username, email, password});

  }

  render() {
    const {auth} = this.props;
    const {agreedToTerms, error} = this.state;
    const email = this.state.email === null ? auth.error && auth.error.email ? auth.error.email : "" : this.state.email;

    return (
      <form id="em-login" ref="emailForm" onSubmit={this.onSubmit.bind(this)} className="login-container">
        <div className="field textfield">
          <input placeholder="E-mail" value={email} type="email" name="email" ref="email" className="textfield__field" onChange={this.onChange} tabIndex="1" />
        </div>
        <div className="field textfield">
          <input placeholder="Username" value={this.state.username} type="text" name="username" onFocus={this.onChange} onChange={this.onChange} className="textfield__field" tabIndex="2" />
        </div>
        <div className="field textfield">
          <input placeholder="Password" value={this.state.password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} className="textfield__field" autoComplete="Off" tabIndex="3" />
        </div>
        <div className="field textfield">
          <input placeholder="Confirm Password" value={this.state.passwordAgain} type="password" name="passwordAgain" onFocus={this.onChange} onChange={this.onChange} className="textfield__field" autoComplete="Off" tabIndex="4" />
        </div>
        <div className="field row checkfield">
          <input type="checkbox" id="ppcbox" name="agreedToTerms" checked={agreedToTerms} onChange={this.onChange} />
          <label htmlFor="ppcbox" ref="agreedToTerms">By checking this box, you agree to our Privacy Policy</label>
        </div>
        <button type="submit" className="field btn pri-btn" tabIndex="5">Sign up</button>
        { auth.error ? <div className="error">{ auth.error.msg }</div> : null }
        { error ? <div className="error">{ error }</div> : null }
      </form>
    );

  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  signup: userData => {
    dispatch(signup(userData));
  }
});

SignUp = connect(mapStateToProps, mapDispatchToProps)(SignUp);
export {SignUp};
