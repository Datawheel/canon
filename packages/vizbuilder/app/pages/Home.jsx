import React from "react";

import Vizbuilder from "../../";

import "./Home.css";

export default class Home extends React.Component {
  render() {
    return <Vizbuilder src="https://canon-api.datausa.io" />;
  }
}
