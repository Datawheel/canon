import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Home.css";

// import yn from "yn";

class Home extends Component {

  render() {
    const {t} = this.props;
    // console.log("yn test", yn("true"));

    // use the 't' function for simple keys and strings, and
    // the Interpolate component for strings with variable replace.
    return (
      <div className="home">
        { t("home.title") }<br />
        { t("This is a full sentence used as the translation key.") }<br />
        { t("home.body", {name: "Datawheel Canon"}) }<br />
        { t("home.sub") }
      </div>
    );

  }
}

export default translate()(Home);
