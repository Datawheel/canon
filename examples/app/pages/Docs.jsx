import React, {Component} from "react";
import PropTypes from "prop-types";
import {hot} from "react-hot-loader/root";
import {strip} from "d3plus-text";

// TODO: Add in docs for the following behaviors in core
// import Login from "./pages/core/Login";
// import SignUp from "./pages/core/SignUp";
// import {Reset} from "@datawheel/canon-core";
import Installation from "./core/Installation";

const PACKAGES = [
  {
    title: "Core",
    icon: "console",
    pages: [
      {
        title: "Installation",
        component: Installation
      }
    ]
  }
];

class Docs extends Component {

  render() {

    const {pkg, page} = this.props.router.params;

    const PageComponent = PACKAGES
      .find(d => strip(d.title).toLowerCase() === pkg)
      .pages
      .find(d => strip(d.title).toLowerCase() === page)
      .component;

    return <PageComponent />;

  }
}

Docs.contextTypes = {
  router: PropTypes.object
};

export default hot(Docs);
export {PACKAGES};
