import React, {Component} from "react";
import {hot} from "react-hot-loader/root";
import Tile from "../fields/ProfileTile";

import "./Related.css";

class Related extends Component {

  render() {

    const {profiles} = this.props;

    return (
      <section className="cp-related">
        <h2 className="cp-section-heading cp-related-heading">Related Profiles</h2>
        <ul className="cp-related-tile-list" key="tl">
          {profiles.map((data, i) =>
            <Tile data={data} key={i} />
          )}
        </ul>
      </section>
    );
  }

}

export default hot(Related);
