import React from "react";
import {Link} from "react-router";

const Home = function() {
  return (
    <div className="page page-home">
      <h1>Vizbuilder Demo Scaffold</h1>
      <ul className="menu">
        <li>
          <Link className="datausa" to="/datausa/visualize">
            DataUSA Vizbuilder
          </Link>
        </li>
        <li>
          <Link className="datausa map" to="/datausa/map">
            DataUSA Map
          </Link>
        </li>
        <li>
          <Link className="datamexico" to="/datamexico">
            DataMexico
          </Link>
        </li>
        <li>
          <Link className="chilecracia" to="/chilecracia">
            Chilecracia
          </Link>
        </li>
        <li>
          <Link className="oec" to="/oec">
            OEC: The Observatory of Economic Complexity
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;
