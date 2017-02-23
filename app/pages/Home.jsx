import React from "react";
import {connect} from "react-redux";
import "./Home.css";

import {fetchData} from "actions/home";

import Child from "./Child";

import Profile from "../../src/components/Profile";
import TopicTitle from "../../src/components/TopicTitle";

class Home extends Profile {

  render() {
    return (
      <div className="home">
        <TopicTitle slug="agriculture">Agriculture</TopicTitle>
        <Child />
      </div>
    );
  }
}

Home.defaultProps = {
  d3plus: {
    shapeConfig: {
      fontFamily: "Comic Sans MS"
    }
  }
};

Home.need = [
  Child,
  fetchData("value_of_production", "api/join/?geo=040AF00182&show=crop&required=harvested_area,value_of_production&order=value_of_production&sort=desc&display_names=true&limit=5")
];

export default connect(state => ({
  data: state.home.data
}), {})(Home);
