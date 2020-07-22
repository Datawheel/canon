import React, {Component} from "react";
import {connect} from "react-redux";

import {LazyImageBg} from "@datawheel/canon-core";
import {range} from "d3-array";

class LazyLoadImage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      list: range(300)
    };
  }

  render() {
    const {list} = this.state;
    return <div>
      <h1>Core Package</h1>
      <h2>LazyLoadImage</h2>
      <p>TO-DO</p>
      <div className="test-tile-container">
        {list.map((l, ix) =>
          <LazyImageBg key={ix} itemClassName="test-tile-class" bgSrc={`https://picsum.photos/300/200?${ix}`}>
            <h3>Name</h3>
            <p>Lorem Text</p>
          </LazyImageBg>
        )}
      </div>
    </div>;

  }
}

LazyLoadImage.need = [
];

export default connect(state => ({
}))(LazyLoadImage);
