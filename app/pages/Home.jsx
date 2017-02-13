import React, {Component} from "react";
import {connect} from "react-redux";
import "./Home.css";

class Home extends Component {

  render() {
    return (
      <div className="home">
        <h1 className="title">Homepage</h1>
      </div>
    );
  }
}

export default connect(() => ({}), {})(Home);
