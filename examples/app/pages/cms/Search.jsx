import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {ProfileSearch} from "@datawheel/canon-cms";
// import axios from "axios";

/** */
async function dataFormat(resp) {
  // console.log("dataFormat", resp);
  // const res = await axios.get("https://datausa.io/api/home");
  // console.log("async", res);
  // resp.data.grouped = [];
  return resp;
}


let oecProfiles = [
  "country",
  "hs92",

  "bilateral-country/partner",
  "bilateral-country",
  "partner",

  "bilateral-product/reporter",
  "bilateral-product",
  "reporter"
];

const subtitles = {
  subnational_chn: "China",
  subnational_deu: "Germany",
  subnational_esp: "Spain",
  subnational_fra: "France",
  subnational_jpn: "Japan",
  subnational_rus: "Russia",
  subnational_usa_state: "United States",
  subnational_usa_district: "US District",
  subnational_usa_port: "US Port",
  subnational_gbr: "United Kingdom",
  subnational_can: "Canada",
  subnational_bra_municipality: "Brazil",
  subnational_bra_state: "Brazil",
  subnational_tur: "Turkey",
  subnational_bol: "Bolivia",
  subnational_zaf: "South Africa",
  subnational_ecu: "Ecuador",
  subnational_col: "Colombia",
  subnational_ind: "India"
};

oecProfiles = oecProfiles.concat(Object.keys(subtitles));

class Search extends Component {

  render() {

    return (
      <div id="Search">
        <h1>CMS Package</h1>
        <h2>Search JSON Endpoint</h2>
        <p>TO-DO</p>
        <h2>React Component</h2>
        <p>When needing user interaction, use the <code className="bp3-code">ProfileSearch</code> component to display the results of a query:</p>
        <ProfileSearch
          availableProfiles={oecProfiles}
          display="grid"
          filters={true}
          filterCubeTitle={d => `<i>${d.replace(/^trade_s_([a-z]{3}).*$/, "$1").replace(/^suelos_sue[0-9]{2}(.*)$/, "$1").toUpperCase()}</i>`}
          // filterDimensionTitle={d => `<i>${d}</i>`}
          // filterHierarchyTitle={d => `<i>${d}</i>`}
          // filterProfileTitle={content => `<i>${(content.label || "Unnamed").replace(/\<[\/p]{1,2}\>/g, "")}</i>`}
          formatResults={dataFormat}
          showExamples={true}
        />
      </div>
    );

  }
}

export default hot(Search);
