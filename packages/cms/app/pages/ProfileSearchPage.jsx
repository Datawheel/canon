import React, {Component} from "react";
import {hot} from "react-hot-loader/root";

import ProfileSearch from "../../src/components/fields/ProfileSearch";
import "./ProfileSearchPage.css";

class ProfileSearchPage extends Component {

  render() {

    return (
      <React.Fragment>
        <h2>Columns Display</h2>
        <div className="profilesearchpage-area columns">

          <ProfileSearch
            display="columns"
            activeKey="s"
            showExamples={true}
            // availableProfiles={["country", "hs92"]}
            columnOrder={["hs92", "country"]}
            columnTitles={{country: "Cool Locations"}}
            />

        </div>
        <h2>Popup Display</h2>
        <div className="profilesearchpage-area popup">

          <ProfileSearch
            inputFontSize="xl"
            display="list"
            showExamples={true}
            position="absolute" />

        </div>
        <h2>List Display</h2>
        <div className="profilesearchpage-area list">

          <ProfileSearch
            inputFontSize="md"
            display="list"
            availableProfiles={["country", "hs92"]}
             />

        </div>
      </React.Fragment>
    );
  }

}

export default hot(ProfileSearchPage);
