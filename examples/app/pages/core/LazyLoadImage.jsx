import React, {Component} from "react";

class LazyLoadImage extends Component {

  render() {
    return <div>
      <h1>Core Package</h1>
      <h2>LazyImage component</h2>
      <h3>Intro</h3>
      <p><code className="bp3-code">LazyImage</code> helps to improve the performance in image-intensive pages. Load the given image as background or img tag when the element is in the viewport. CSS, layout and content (childrens) are implementation responsability.</p>
      Built with:
      <ul>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API" target="_blank" rel="noreferrer">Intersection Observer API</a> using <a href="https://github.com/researchgate/react-intersection-observer" target="_blank" rel="noreferrer">react-intersection-observer</a> to detect when the box is visible in the viewport.</li>
      </ul>
      <h3>Basic usage as background-image style (with childrens)</h3>
      <p>Import:</p>
      <code className="bp3-code">
        import &#123;LazyImage&#125; from "@datawheel/canon-core";
      </code>
      <p>Render:</p>
      <code className="bp3-code">
        &lt;LazyImage imageProps=&#123;&#123;className:&quot;test-tile-class&quot;, src:&quot;path/to/image&quot;&#125;&#125; backgroundImage=&#123;true&#125; &gt;<br />
        &nbsp;&nbsp;&lt;h3&gt;Name&lt;/h3&gt;<br />
        &nbsp;&nbsp;&lt;p&gt;Lorem Text&lt;/p&gt;<br />
        &lt;/LazyImage&gt;
      </code>
      <p>SSR result:</p>
      <code className="bp3-code">
        &lt;div class=&quot;canon-lazy-image-wrapper test-tile-class&quot;&gt;<br />
        &nbsp;&nbsp;&lt;h3&gt;Name&lt;/h3&gt;<br />
        &nbsp;&nbsp;&lt;p&gt;Lorem Text&lt;/p&gt;<br />
        &lt;/div&gt;
      </code>
      <p>Once in viewport:</p>
      <code className="bp3-code">
        &lt;div class=&quot;canon-lazy-image-wrapper test-tile-class&quot; style=&quot;background-image: url('path/to/image');&quot;&gt;<br />
        &nbsp;&nbsp;&lt;h3&gt;Name&lt;/h3&gt;<br />
        &nbsp;&nbsp;&lt;p&gt;Lorem Text&lt;/p&gt;<br />
        &lt;/div&gt;
      </code>
      <h3>Basic usage as  &lt;img&gt; tag</h3>
      <p>Import:</p>
      <code className="bp3-code">
        import &#123;LazyImage&#125; from "@datawheel/canon-core";
      </code>
      <p>Render:</p>
      <code className="bp3-code">
        &lt;LazyImage imageProps=&#123;&#123;className:&quot;test-tile-class&quot;, src:&quot;path/to/image&quot;&#125;&#125; /&gt;
      </code>
      <p>SSR result:</p>
      <code className="bp3-code">
        &lt;div class=&quot;canon-lazy-image-wrapper test-tile-class&quot;&gt;<br />
        &nbsp;&nbsp;&lt;img class=&quot;canon-lazy-image-img test-tile-class-img&quot; src=&quot;&quot; /&gt;<br />
        &lt;/div&gt;
      </code>
      <p>Once in viewport:</p>
      <code className="bp3-code">
        &lt;div class=&quot;canon-lazy-image-wrapper test-tile-class&quot;&gt;<br />
        &nbsp;&nbsp;&lt;img class=&quot;canon-lazy-image-img test-tile-class-img&quot; src=&quot;path/to/image&quot; /&gt;<br />
        &lt;/div&gt;
      </code>
      <h3>Props</h3>
      <ul>
        <li><code className="bp3-code">backgroundImage</code>: Boolean that defines the behaviour needed. Default false (tag img)</li>
        <li><code className="bp3-code">imageProps</code>: JSON object with specific configuration:</li>
        <ul>
          <li><code className="bp3-code">src</code>: Image url/path.</li>
          <li><code className="bp3-code">className</code>: Custom class for generated element.</li>
          <li><code className="bp3-code">alt</code>: Alternative text for tag img (only used when <code className="bp3-code">backgroundImage: true</code>).</li>
        </ul>
        <li><code className="bp3-code">observerProps</code>: JSON object with observer component options available <code className="bp3-code">root</code>, <code className="bp3-code">rootMargin</code>, <code className="bp3-code">threshold</code>, <code className="bp3-code">disabled</code>. See more <a href="https://github.com/researchgate/react-intersection-observer#options">here</a>.</li>
      </ul>
      <h3>Demo</h3>
      <p><a href="/docs/core-package/lazy-load-images-demo">See here.</a></p>
    </div>;

  }
}

export default LazyLoadImage;
