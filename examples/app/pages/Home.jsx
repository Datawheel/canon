import {Activate} from "@datawheel/canon-core";
import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import {withNamespaces} from "react-i18next";

import "./Home.css";

class Home extends Component {

  render() {

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
        <Activate location={this.props.location} />
      </div>
    );

  }
}

export default withNamespaces()(hot(Home));
