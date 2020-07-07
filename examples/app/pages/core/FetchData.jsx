import {fetchData, needWebWorkerPromise} from "@datawheel/canon-core";
import React, {Component} from "react";
import {connect} from "react-redux";

class FetchData extends Component {

  render() {
    const {randomSum, swFilms, swPeople, swPlanets, swSpecies, swStarships, swVehicles} = this.props.data;
    return <div>
      <h1>Core Package</h1>
      <h2>FetchData</h2>
      <p>TO-DO</p>
      <h2>Test with Star Wars API https://swapi.dev/ :</h2>
      <p>Films: {swFilms.count}</p>
      <p>Characters: {swPeople.count}</p>
      <p>Planets: {swPlanets.count}</p>
      <p>Species: {swSpecies.count}</p>
      <p>Starships: {swStarships.count}</p>
      <p>Vehicles: {swVehicles.count}</p>
      <h2>Custom hard calcs results:</h2>
      <p>Number: {randomSum}</p>
    </div>;

  }
}

FetchData.need = [
  // fetchData("simple", "/api/simple"),
  // fetchData("slug", "/api/slug/<page>"),
  fetchData("swFilms",      "https://swapi.dev/api/films/"),
  fetchData("swPeople",     "https://swapi.dev/api/people/"),
  fetchData("swPlanets",    "https://swapi.dev/api/planets/"),
  fetchData("swSpecies",    "https://swapi.dev/api/species/"),
  fetchData("swStarships",  "https://swapi.dev/api/starships/"),
  fetchData("swVehicles",   "https://swapi.dev/api/vehicles/"),
  (params, store) => {

    const doHardThings = () => {
      let sum = 0;
      for (let index = 0; index < 100000000; index++) {
        sum += Math.random() * 100;
      }
      return sum;
    };

    const prm = needWebWorkerPromise("randomSum", doHardThings);

    return {
      type: "GET_DATA",
      promise: prm,
      description: "Test Web Worker Wrapper"
    };
  }
];

export default connect(state => ({
  data: state.data
}))(FetchData);
