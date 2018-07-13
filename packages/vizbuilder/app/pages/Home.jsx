import React from "react";
import KonamiCode from "konami-code";

import Vizbuilder from "../../src/";

import "./Home.css";

const DATAUSA = "https://canon-api.datausa.io";

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      source:
        typeof window !== "undefined"
          ? window.localStorage.getItem("source") || DATAUSA
          : DATAUSA
    };
  }

  componentDidMount() {
    const kc = new KonamiCode();
    kc.listen(() => {
      const source = window.prompt(
        "Please input a Mondrian server URL.\nLeave the field empty to use DataUSA again.",
        DATAUSA
      );
      localStorage.setItem("source", source);
      this.setState({source: source || DATAUSA});
    });
    this.kc = kc;
  }

  render() {
    return <Vizbuilder src={this.state.source} />;
  }
}
