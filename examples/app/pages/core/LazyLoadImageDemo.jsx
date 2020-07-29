import React, {Component} from "react";
import {LazyImage} from "@datawheel/canon-core";
import {range} from "d3-array";

class LazyLoadImageDemo extends Component {

  render() {
    return <div>
      <h1>Core Package</h1>
      <h2>LazyImage component test</h2>
      <p><a href="/docs/core-package/lazy-load-images">See docs here.</a></p>
      <p>Inspect this page to see example CSS in containers, wrappers and tiles that are all implementation responsability.</p>
      <h3>Demo</h3>
      <h4>1. Default window container example, bg image with children</h4>
      <p>Scroll the full page to see it in action.</p>
      <style>{"\
        .test-tile-container{\
          display:flex;\
          flex-wrap: wrap;\
        }\
        .test-tile-container-wrapper{\
          display:flex;\
          flex-wrap: wrap;\
          height: 300px;\
          overflow: scroll;\
          border: 1px solid #ccc;\
        }\
        .test-tile-class{\
          width: 25%;\
          min-height: 100px;\
          padding: 5px;\
          background-color: #eee;\
        }\
        .test-img-class{\
          min-height: 250px;\
          background-color: #eee;\
        }\
      "}</style>
      <div className="test-tile-container">
        {range(48).map((l, ix) =>
          <LazyImage key={ix} imageProps={{className: "test-tile-class", src: `https://picsum.photos/300/200?a${ix}`}} backgroundImage={true} >
            <h3>{ix + 1}. Name</h3>
            <p>Lorem Text</p>
          </LazyImage>
        )}
      </div>
      <h4>2. Custom root element container example, bg image with children</h4>
      <p>Scroll in the container to see it in action.</p>
      <div className="test-tile-container-wrapper" style={{height: "200px", overflow: "scroll", border: "1px solid #ccc"}}>
        {range(48).map((l, ix) =>
          <LazyImage key={ix} observerProps={{root: "#test-tile-container-wrapper"}} imageProps={{className: "test-tile-class", src: `https://picsum.photos/300/200?b${ix}`}} backgroundImage={true}>
            <>
              <h3>{ix + 1}. Name</h3>
              <p>Lorem Text</p>
            </>
          </LazyImage>
        )}
      </div>
      <h4>3. Default window container example with tag img.</h4>
      <p>Scroll to see it in action.</p>
      <div className="test-image-container">
        {range(10).map((l, ix) =>
          <LazyImage key={ix} imageProps={{className: "test-img-class", src: `https://picsum.photos/500/250?c${ix}`}} backgroundImage={false} />
        )}
      </div>
    </div>;

  }
}

export default LazyLoadImageDemo;
