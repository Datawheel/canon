import {isAuthenticated} from "@datawheel/canon-core";
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

import TopNav from "components/TopNav";
import SideNav from "components/SideNav";
import Footer from "components/Footer";

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

    return <div id="App">
      <TopNav />
      <main>
        <SideNav key="sidenav" />
        <Fragment key="children">{ children }</Fragment>
      </main>
      <Footer />
    </div>;
  }

}

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(state => ({env: state.env}), mapDispatchToProps)(App);
