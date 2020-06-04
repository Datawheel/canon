import {AnchorLink, CanonProfile, fetchData, TopicTitle} from "@datawheel/canon-core";
import {dataFold} from "d3plus-viz";
import React, {Component} from "react";
import Helmet from "react-helmet";
import {hot} from "react-hot-loader/root";
import {connect} from "react-redux";
import {Link} from "react-router";

import Viz1 from "./Viz1";
import Viz2 from "./Viz2";
import Viz3 from "./Viz3";

import "./Profile.css";

const topics = [
  {
    slug: "agriculture",
    title: "Agriculture",
    sections: [
      Viz1
    ]
  },
  {
    slug: "climate",
    title: "Climate",
    sections: [
      Viz2, Viz3
    ]
  }
];

class Profile extends Component {

  render() {
    const {competitors, topCrop} = this.props.data;
    // const {env, location} = this.props;
    // console.log(env);
    if (!topCrop) return null;

    return (
      <CanonProfile topics={topics}>
        <Helmet>
          <title>{ this.props.params.id === "040AF00182" ? "Nigeria" : "Ethopia" }</title>
        </Helmet>
        <h1>{ this.props.params.id === "040AF00182" ? "Nigeria" : "Ethopia" }</h1>
        <p>Top Crop ID (from &quot;preneed&quot;): { topCrop.crop }</p>
        <p>{ topCrop.crop } Competitors (&quot;need&quot; using &quot;preneed&quot; in URL): { competitors ? competitors.map(c => c.geo_name).join(", ") : "Loading" }</p>

        <div className="profile-body">
          <div className="offset-content">
            <TopicTitle slug="agriculture">Agriculture</TopicTitle>
            <Viz1 />
            <TopicTitle slug="climate">Climate</TopicTitle>
            <Viz2 />
            <Viz3 />

            <Link to="/profile/040AF00182">Jump to Nigeria</Link>
            <Link to="/profile/040AF00079">Jump to Ethopia</Link>
          </div>

        </div>

        <AnchorLink className="custom-class" to="agriculture">Jump to Agriculture</AnchorLink>

      </CanonProfile>
    );
  }
}

const topCropUrl = "https://api.dataafrica.io/api/join/?show=year,crop&sumlevel=latest_by_geo,lowest&required=harvested_area&order=harvested_area&sort=desc&display_names=true&geo=<id>&limit-1";
Profile.preneed = [
  fetchData("topCrop", topCropUrl, res => dataFold(res)[0])
];

Profile.need = [
  Viz1, Viz2, Viz3,
  fetchData("competitors", "api/join/?show=geo&sumlevel=adm0&crop=<topCrop.crop>&required=harvested_area&order=harvested_area&sort=desc&display_names=true", dataFold),
  fetchData("value_of_production", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=value_of_production&sort=desc&display_names=true&limit=5", dataFold)
];

export default connect(state => ({
  data: state.data,
  env: state.env,
  location: state.location
}), {})(hot(Profile));
