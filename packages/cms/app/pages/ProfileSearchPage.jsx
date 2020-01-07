import React, {Component} from "react";
import {hot} from "react-hot-loader/root";

import ProfileSearch from "../../src/components/fields/ProfileSearch";
import "./ProfileSearchPage.css";

class ProfileSearchPage extends Component {

  render() {

    return (
      <React.Fragment>
        <h2>Columns Display</h2>
        <div className="profilesearchpage-area">
          <ProfileSearch display="columns" />
        </div>
        <h2>List Display</h2>
        <div className="profilesearchpage-area">
          <ProfileSearch display="list" />
        </div>
      </React.Fragment>
    );
  }

}

export default hot(ProfileSearchPage);
