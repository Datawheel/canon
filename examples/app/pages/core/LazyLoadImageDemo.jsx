import React, {Component} from "react";
import {LazyImageBg} from "@datawheel/canon-core";
import {range} from "d3-array";

class LazyLoadImageDemo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      list: range(100)
    };
  }

  render() {
    const {list} = this.state;
    return <div>
      <h1>Core Package</h1>
      <h2>LazyImageBg test</h2>
      <p><a href="/docs/core-package/lazy-load-images">See docs here.</a></p>
      <h3>Demo</h3>
      <h3>Demo: Default window container example</h3>
      <p>Scroll the full page to see it in action.</p>
      <div className="test-tile-container">
        {list.map((l, ix) =>
          <LazyImageBg key={ix} itemClassName="test-tile-class" bgSrc={`https://picsum.photos/300/200?b${ix}`}>
            <h3>{ix + 1}. Name</h3>
            <p>Lorem Text</p>
          </LazyImageBg>
        )}
      </div>
      <h3>Demo: Custom root element container example</h3>
      <p>Scroll in the container to see it in action.</p>
      <div id="test-tile-container-wrapper" style={{height: "200px", overflow: "scroll", border: "1px solid #ccc"}}>
        {list.map((l, ix) =>
          <LazyImageBg key={ix} root="#test-tile-container-wrapper" itemClassName="test-tile-class" bgSrc={`https://picsum.photos/300/200?a${ix}`}>
            <h3>{ix + 1}. Name</h3>
            <p>Lorem Text</p>
          </LazyImageBg>
        )}
      </div>
    </div>;

  }
}

export default LazyLoadImageDemo;
