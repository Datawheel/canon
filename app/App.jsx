import React, {Component} from "react";
import {connect} from "react-redux";
import Nav from "components/Nav";
import Footer from "components/Footer";

import "./App.css";

import {fetchData, isAuthenticated} from "@datawheel/canon-core";

class App extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {
    const {children} = this.props;
    // console.log(this.props.env);
    return <div id="App">
      <Nav />
      <div className="test-1"></div>
      <div className="test-2"></div>
      <div className="box red"></div>
      <div className="box green"></div>
      <div className="box custom"></div>
      <div>{ children }</div>
      <Footer />
    </div>;
  }

}

// App.need = [
//   fetchData("test404", "https://preview.datausa.io/api/data?measure=Population", () => ({error: 404})),
//   fetchData("test503", "https://preview.datausa.io/api/data?measure=Population", () => ({error: 503})),
//   fetchData("test202", "https://preview.datausa.io/api/data?measure=Population", () => ({data: []}))
// ];

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(state => ({env: state.env}), mapDispatchToProps)(App);
