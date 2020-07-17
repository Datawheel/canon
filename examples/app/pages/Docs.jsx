import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {hot} from "react-hot-loader/root";
import {strip} from "d3plus-text";

import TopNav from "components/TopNav";
import SideNav from "components/SideNav";
import Footer from "components/Footer";

// TODO: Add in docs for the following behaviors in core
// import Login from "./pages/core/Login";
// import SignUp from "./pages/core/SignUp";
// import {Reset} from "@datawheel/canon-core";
// Overview
import Installation from "./overview/Installation";
import Contribution from "./overview/Contribution";
import Commands from "./overview/Commands";

// Core
import IntroCore from "./core/Intro";
import Login from "./core/Login";
import SignUp from "./core/SignUp";
import NotFound from "./core/NotFound";
import I18n from "./core/I18n";
import FetchData from "./core/FetchData";

// CMS
import IntroCms from "./cms/Intro";
import Search from "./cms/Search";

// VizBuilder
import IntroVB from "./vizbuilder/Intro";

// Create Canon
import IntroCreateCanon from "./create-canon/Intro";

const PACKAGES = [
  {
    title: "Overview",
    icon: "console",
    pages: [
      {title: "Installation", component: Installation},
      {title: "Contribution", component: Contribution},
      {title: "Commands", component: Commands}
    ]
  },
  {
    title: "Core Package",
    icon: "cog",
    pages: [
      {title: "Intro", component: IntroCore},
      {title: "Login", component: Login},
      {title: "SignUp", component: SignUp},
      {title: "Not Found", component: NotFound},
      {title: "I18n", component: I18n},
      {title: "FetchData", component: FetchData}
    ]
  },
  {
    title: "Create Canon Package",
    icon: "new-object",
    pages: [
      {title: "Intro", component: IntroCreateCanon}
    ]
  },
  {
    title: "CMS Package",
    icon: "new-text-box",
    pages: [
      {title: "Intro", component: IntroCms},
      {title: "Search", component: Search}
    ]
  },
  {
    title: "Viz Builder Package",
    icon: "chart",
    pages: [
      {title: "Intro", component: IntroVB}
    ]
  }

];

class Docs extends Component {

  render() {

    const {location} = this.props;
    const {pkg, page} = this.props.router.params;

    const PageComponent = PACKAGES
      .find(d => strip(d.title).toLowerCase() === pkg)
      .pages
      .find(d => strip(d.title).toLowerCase() === page)
      .component;

    return <Fragment>
      <TopNav />
      <main id="docs">
        <SideNav key="sidenav" pathname={location.pathname} />
        <div key="children" className="content">
          <PageComponent />
        </div>
      </main>
      <Footer />
    </Fragment>;

  }
}

Docs.need = [
  FetchData
];

Docs.contextTypes = {
  router: PropTypes.object
};

export default hot(Docs);
export {PACKAGES};
