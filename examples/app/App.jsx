import {isAuthenticated} from "@datawheel/canon-core";
import React, {Component} from "react";
import {connect} from "react-redux";

import "./App.css";

class App extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {
    const {children} = this.props;

    return <div id="app">
      { children }
    </div>;
  }

}

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(state => ({env: state.env}), mapDispatchToProps)(App);
