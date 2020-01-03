import React, {Component} from "react";
import ProfileSearch from "../../src/components/fields/ProfileSearch";

export default class ProfileSearchPage extends Component {

  render() {

    return (
      <React.Fragment>
        <h2>List Display</h2>
        <ProfileSearch display="list" />
        <hr />
        <h2>Columns Display</h2>
        <ProfileSearch display="columns" />
      </React.Fragment>
    );
  }

}
