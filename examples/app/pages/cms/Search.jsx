import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {ProfileSearch} from "@datawheel/canon-cms";
import axios from "axios";

/** */
async function dataFormat(resp) {
  console.log("dataFormat", resp);
  const res = await axios.get("https://datausa.io/api/home");
  console.log("async", res);
  resp.data.grouped = [];
  return resp;
}

class Search extends Component {

  render() {

    return (
      <div id="Search">
        <h1>CMS Package</h1>
        <h2>Search JSON Endpoint</h2>
        <p>TO-DO</p>
        <h2>React Component</h2>
        <p>When needing user interaction, use the <code className="bp3-code">ProfileSearch</code> component to display the results of a query:</p>
        <ProfileSearch formatResults={dataFormat} />
      </div>
    );

  }
}

export default hot(Search);
