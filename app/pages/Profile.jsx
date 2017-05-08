import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import "./Home.css";

import {fetchData} from "../../src/actions/fetchData";

import Child from "./Child";
import Child2 from "./Child2";

import {AnchorLink, CanonComponent, TopicTitle} from "../../src";

const d3plus = {
  shapeConfig: {
    fontFamily: "Comic Sans MS"
  }
};

class Profile extends Component {

  render() {
    return (
      <CanonComponent data={this.props.data} d3plus={d3plus}>
        <div className="home">
          <h1>{ this.props.params.id === "040AF00182" ? "Nigeria" : "Ethopia" }</h1>
          <TopicTitle slug="agriculture">Agriculture</TopicTitle>
          <Child />
          <TopicTitle slug="climate">Climate</TopicTitle>
          <Child2 />
          <Link to="/profile/040AF00182">Jump to Nigeria</Link>
          <Link to="/profile/040AF00079">Jump to Ethopia</Link>
          <AnchorLink className="custom-class" to="agriculture">Jump to Agriculture</AnchorLink>
        </div>
      </CanonComponent>
    );
  }
}

Profile.need = [
  Child, Child2,
  fetchData("value_of_production", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=value_of_production&sort=desc&display_names=true&limit=5")
];

export default connect(state => ({
  data: state.data
}), {})(Profile);
