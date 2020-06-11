import {fetchData} from "@datawheel/canon-core";
import React, {Component} from "react";
import {connect} from "react-redux";

class Slug extends Component {

  render() {
    console.log(this.props.router.params.slug);
    console.log(this.props.slugger);
    return <div>
      { this.props.router.params.slug }
    </div>;

  }
}

Slug.need = [
  fetchData("slugger", "/api/slug/<slug>")
];

export default connect(state => ({
  slugger: state.data.slugger
}))(Slug);
