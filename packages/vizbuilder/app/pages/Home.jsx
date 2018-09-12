import React from "react";
import KonamiCode from "konami-code";

import Vizbuilder from "../../src/";

import "./Home.css";

const DATAUSA = "https://canon-api.datausa.io";

const DEFAULT_TOPOJSON = {
  default: {
    topojson: "/topojson/world.json",
    topojsonId: "id",
    topojsonKey: "countries"
  },
  State: {
    topojson: "/topojson/states.json",
    topojsonId: "id",
    topojsonKey: "states"
  },
  Puma: {
    topojson: "/topojson/pumas.json",
    topojsonId: "id",
    topojsonKey: "pumas"
  },
  get PUMA() {
    return this.Puma;
  },
  Msa: {
    topojson: "/topojson/msas.json",
    topojsonId: "id",
    topojsonKey: "msas"
  }
};

const DEFAULT_CONFIG = {
  totalConfig: {
    fontSize: 10,
    padding: 5,
    resize: false,
    textAnchor: "middle"
  },
  confidenceConfig: {
    fillOpacity: 0.15
  },
  ocean: "transparent",
  projection: "geoAlbersUsa",
  tiles: false,
  zoom: true,
  zoomFactor: 2
};

const DEFAULT_PERMAKEYS = {
  measure: "msr",
  dimension: "dim",
  level: "lvl",
  enlarged: "show"
};

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
    return <Vizbuilder
      config={DEFAULT_CONFIG}
      src={this.state.source}
      topojson={DEFAULT_TOPOJSON}
      defaultDimension={["Geography", "Gender", "Age"]}
      defaultLevel={["State"]}
      permalinkKeywords={DEFAULT_PERMAKEYS}
    />;
  }
}
