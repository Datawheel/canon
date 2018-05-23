import React from "react";

import Vizbuilder from "../../src/index.jsx";

import "./Home.css";

export default class Home extends React.Component {
  render() {
    return <Vizbuilder src="https://chilecube.datawheel.us" />;
  }
}
