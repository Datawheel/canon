import {fetchData} from "@datawheel/canon-core";
import React, {Component} from "react";
import {connect} from "react-redux";

class FetchData extends Component {

  render() {
    console.log(this.props.data);
    return <div>
      <h1>Core Package</h1>
      <h2>FetchData</h2>
      <p>TO-DO</p>
    </div>;

  }
}

FetchData.need = [
  fetchData("simple", "/api/simple"),
  fetchData("slug", "/api/slug/<page>")
];

export default connect(state => ({
  data: state.data
}))(FetchData);
