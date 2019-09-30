import React, {Component} from "react";
import {Search} from "../../src/";

export default class SearchPage extends Component {

  onClick(d) {
    console.log(d);
  }

  render() {
    return (
      <div id="Search">
        <Search
          render={d => <span onClick={this.onClick.bind(this, d)}>{d.name}</span>}
          dimension="Geography"
          limit={20}
        />
        Text underneath search.
      </div>
    );
  }

}
