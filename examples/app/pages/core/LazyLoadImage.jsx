import React, {Component} from "react";

class LazyLoadImage extends Component {

  render() {
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
      <h3>Demo</h3>
      <p><a href="/docs/core-package/lazy-load-images-demo">See here.</a></p>
    </div>;

  }
}

export default LazyLoadImage;
