import React from "react";
import {Link} from "react-router";

const Home = function() {
  return (
    <div className="page page-home">
      <h1>Vizbuilder Demo Scaffold</h1>
      <ul className="menu">
        <li>
          <Link to="/datausa/visualize">DataUSA Vizbuilder</Link>
        </li>
        <li>
          <Link to="/datausa/map">DataUSA Map</Link>
        </li>
        <li>
          <Link to="/datamexico">DataMexico</Link>
        </li>
        <li>
          <Link to="/chilecracia">Chilecracia</Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;
