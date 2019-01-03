import React, {Component} from "react";
import {Link} from "react-router";
import {withNamespaces, Trans} from "react-i18next";
import "./Home.css";
import {Button} from "@blueprintjs/core";
import {Activate} from "../../src/";
// import Vizbuilder from "@datawheel/canon-vizbuilder";

// import styles from "style.yml";

// import yn from "yn";

class Home extends Component {

  render() {
    const {t} = this.props;
    const count = 5, name = "Dave";
    // console.log("yn test", yn("true"));
    // console.log(styles);
    // use the 't' function for simple keys and strings, and
    // the Interpolate component for strings with variable replace.
    return (
      <div className="home">
        { t("home.title") }<br />
        { t("This is a full sentence used as the translation key") }<br />
        { t("home.body", {name: "Datawheel Canon"}) }<br />
        { t("home.sub") }
        <Trans i18nKey="complexTrans" count={count}>
          Hello <strong>{{name}}</strong>, you have {{count}} unread message. <Link to="/profile/040AF00182">Click here</Link>.
        </Trans>
        <Button>Fake Button</Button>
        <Activate location={this.props.location} />
        <div className="spacer">
          testing
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
          <br/><br/><br/><br/><br/>
        </div>
        <div id="anchorTest" className="anchorTest">
          jump here!!!!
        </div>
        <Link to="/login">Click Here to Login</Link>
      </div>
    );

  }
}

export default withNamespaces()(Home);
