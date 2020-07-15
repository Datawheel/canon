import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {ProfileSearch} from "@datawheel/canon-cms";

class Search extends Component {

  render() {

    return (
      <div id="Search">
        <h1>CMS Package</h1>
        <h2>Search JSON Endpoint</h2>
        <p>TO-DO</p>
        <h2>React Component</h2>
        <p>When needing user interaction, use the <code className="bp3-code">ProfileSearch</code> component to display the results of a query:</p>
        <ProfileSearch />
      </div>
    );

  }
}

export default hot(Search);
