import React from "react";
import {Client} from "mondrian-rest-client";
import UpdatedMeasureSelect from "../../src/components/Sidebar/AllMeasureSelect";
import {injectCubeInfoOnMeasure, fetchCubes} from "../../src/helpers/fetch";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import {defaultProps} from "../../src";
import {resetClient} from "../../src/helpers/api";
import initialStateFactory from "../../src/state";
import {ENDPOINT} from "./params";

class SelectPage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.client = new Client("https://flint-api.datausa.io");
    this.state = initialStateFactory();
  }

  componentDidMount() {
    const fetchParams = {
      defaultMeasure: "Total Population",
      defaultTable: "",
      defaultGroup: [
        "Geography.State",
        "Origin State.Origin State",
        "Gender.Gender",
        "Age.Age"
      ]
    };
    resetClient(ENDPOINT);
    fetchCubes(fetchParams, defaultProps).then(state => this.setState(state));
  }

  selectHandler(item) {
    console.log("Selected:", item);
  }

  render() {
    const {options, query} = this.state;
    return (
      <div className="site-wrapper">
        <UpdatedMeasureSelect
          items={options.measures}
          activeItem={query.measure}
          onItemSelect={this.selectHandler}
        />
      </div>
    );
  }
}

export default SelectPage;
