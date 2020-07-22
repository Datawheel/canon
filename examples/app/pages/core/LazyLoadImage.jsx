import React, {Component} from "react";
import {connect} from "react-redux";

import {LazyImageBg} from "@datawheel/canon-core";
import {range} from "d3-array";

class LazyLoadImage extends Component {

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
      <h2>LazyImageBg component</h2>
      <h3>Intro</h3>
      <p><code className="bp3-code">LazyImageBg</code> helps to improve the performance in image-intensive pages. Load the given image as background when the element is in the viewport. CSS, layout and content (childrens) are implementation responsability.</p>
      Built using:
      <ul>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API" target="_blank" without rel="noreferrer">Intersection Observer API</a> using <a href="https://github.com/researchgate/react-intersection-observer" target="_blank" without rel="noreferrer">react-intersection-observer</a> to detect when the box is visible in the viewport.</li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API" target="_blank" without rel="noreferrer">Web Workers API</a> using <a href="https://github.com/GoogleChromeLabs/comlink" target="_blank" without rel="noreferrer">Comlink</a> to load the image as blob in a separate thread.</li>
      </ul>
      <h3>Usage</h3>
      <p>Import:</p>
      <code className="bp3-code">
        import &#123;LazyImageBg&#125; from "@datawheel/canon-core";
      </code>
      <p>Render:</p>
      <code className="bp3-code">
        &lt;LazyImageBg itemClassName=&quot;test-tile-class&quot; bgSrc="path/to/image"&gt;<br />
        &nbsp;&nbsp;&lt;h3&gt;Name&lt;/h3&gt;<br />
        &nbsp;&nbsp;&lt;p&gt;Lorem Text&lt;/p&gt;<br />
        &lt;/LazyImageBg&gt;
      </code>
      <p>SSR result:</p>
      <code className="bp3-code">
        &lt;div class=&quot;test-tile-class&quot;&gt;<br />
        &nbsp;&nbsp;&lt;h3&gt;Name&lt;/h3&gt;<br />
        &nbsp;&nbsp;&lt;p&gt;Lorem Text&lt;/p&gt;<br />
        &lt;/div&gt;
      </code>
      <p>Once in viewport:</p>
      <code className="bp3-code">
        &lt;div class=&quot;test-tile-class&quot; style=&quot;background-image: url('path/to/image');&quot;&gt;<br />
        &nbsp;&nbsp;&lt;h3&gt;Name&lt;/h3&gt;<br />
        &nbsp;&nbsp;&lt;p&gt;Lorem Text&lt;/p&gt;<br />
        &lt;/div&gt;
      </code>
      <h3>Props</h3>
      <ul>
        <li><code className="bp3-code">itemClassName</code>: Classname for the element.</li>
        <li><code className="bp3-code">bgSrc</code>: Background image url/path.</li>
        <li>Observer component options available <code className="bp3-code">root</code>, <code className="bp3-code">rootMargin</code>, <code className="bp3-code">threshold</code>, <code className="bp3-code">disabled</code>. See more <a href="https://github.com/researchgate/react-intersection-observer#options">here</a>.</li>
      </ul>
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
    </div>;

  }
}

LazyLoadImage.need = [
];

export default connect(state => ({
}))(LazyLoadImage);
