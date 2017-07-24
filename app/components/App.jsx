import React, {Component} from "react";
import {connect} from "react-redux";
import Nav from "components/Nav";
import Footer from "components/Footer";
import "normalize.css/normalize.css";

import "./App.css";

import {isAuthenticated} from "../../src";

class App extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {
    const {children} = this.props;
    return (
      <div className="container">
        <Nav />
        <div className="test-1"></div>
        <div className="test-2"></div>
        { children }
        <Footer />
      </div>
    );
  }

}

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(() => ({}), mapDispatchToProps)(App);
