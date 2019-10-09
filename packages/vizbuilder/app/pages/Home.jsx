import React from "react";
import {Link} from "react-router";

import "./Home.css";

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="home">
        <ul>
          <li>
            <Link to="/map">Map</Link>
          </li>
          <li>
            <Link to="/visualize">Vizbuilder</Link>
          </li>
          <li>
            <Link to="/select">Select component</Link>
          </li>
          <li>
            <Link to="/multiselect">MultiSelect component</Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default Home;
