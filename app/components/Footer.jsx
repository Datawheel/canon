import React, {Component} from "react";
import {connect} from "react-redux";
import "./Footer.css";

class Footer extends Component {

  render() {

    return (
      <footer>
        <img className="datawheel" src="/images/logos/datawheel.png" />
      </footer>
    );

  }
}

export default connect(() => ({}), {})(Footer);
