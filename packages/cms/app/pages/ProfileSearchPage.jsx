import React, {Component} from "react";
import ProfileSearch from "../../src/components/fields/ProfileSearch";
import "./ProfileSearchPage.css";

export default class ProfileSearchPage extends Component {

  render() {

    return (
      <React.Fragment>
        <h2>List Display</h2>
        <div className="profilesearchpage-area">
          <ProfileSearch display="list" />
        </div>
        <h2>Columns Display</h2>
        <div className="profilesearchpage-area">
          <ProfileSearch display="columns" />
        </div>
      </React.Fragment>
    );
  }

}
