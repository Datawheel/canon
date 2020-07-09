import {Activate} from "@datawheel/canon-core";
import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {withNamespaces} from "react-i18next";

import TopNav from "components/TopNav";
import SideNav from "components/SideNav";
import Footer from "components/Footer";

import "./Home.css";

class Home extends Component {

  render() {

    const {location} = this.props;

    // use the 't' function for simple keys and strings, and
    // the Interpolate component for strings with variable replace.
    // const {t} = this.props;
    // const count = 5, name = "Dave";

    return (
      <div className="home">
        {/* { t("home.title") }<br />
        { t("This is a full sentence used as the translation key") }<br />
        { t("home.body", {name: "Datawheel Canon"}) }<br />
        { t("home.sub") }
        <Trans i18nKey="complexTrans" count={count}>
          Hello <strong>{{name}}</strong>, you have {{count}} unread message. <Link to="/profile/040AF00182">Click here</Link>.
        </Trans> */}
        <TopNav />
        <main id="docs">
          <SideNav key="sidenav" pathname={location.pathname} />
          <div key="children" className="content">
            Hello Home
          </div>
        </main>
        <Footer />
        <Activate location={this.props.location} />
      </div>
    );

  }
}

export default withNamespaces()(hot(Home));
