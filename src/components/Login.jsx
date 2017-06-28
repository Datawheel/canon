import React, {Component} from "react";
import {connect} from "react-redux";
import {login} from "../actions/auth";

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      password: "",
      email: null
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  onSubmit(e) {

    e.preventDefault();
    const {password} = this.state;
    const email = this.state.email === this.refs.email.value ? this.state.email : this.refs.email.value;

    this.props.login({email, password});

  }

  render() {
    const {auth} = this.props;
    const {error} = this.state;
    const email = this.state.email === null ? auth.error && auth.error.email ? auth.error.email : "" : this.state.email;

    return (
      <form id="em-login" ref="emailForm" onSubmit={this.onSubmit.bind(this)} className="login-container">
        <div className="field textfield">
          <input placeholder="E-mail" value={email} type="email" name="email" ref="email" className="textfield__field" onChange={this.onChange} tabIndex="1" />
        </div>
        <div className="field textfield">
          <input placeholder="Password" value={this.state.password} type="password" name="password" onFocus={this.onChange} onChange={this.onChange} className="textfield__field" autoComplete="Off" tabIndex="3" />
        </div>
        <button type="submit" className="field btn pri-btn" tabIndex="5">Login</button>
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
  login: userData => {
    dispatch(login(userData));
  }
});

// export default (Login);
Login = connect(mapStateToProps, mapDispatchToProps)(Login);
export {Login};
