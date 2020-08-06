import React, {Component} from "react";
import {Link} from "react-router";

export default class NotFound extends Component {

  render() {
    return (
      <div>
        <h1>Core Package</h1>
        <h2>Links</h2>
        <p>Canon uses <code className="bp3-code">react-router</code> to control the site&apos;s navigation.</p>
        <p>The proper way to write links in this context is to use <code className="bp3-code">Link</code></p>
        <p><code className="bp3-code">import &#123;Link&#125; from &#x22;react-router&#x22;;<br/>
        ...<br/>
        &#x3C;Link to=&#x22;/path/to/page&#x22;&#x3E;Go to page!&#x3C;/Link&#x3E;
        </code></p>
        <p>Examples: <Link to="/">Go to home</Link>|<Link to="/?test=true#test-hash">Go to home with get params and hash</Link></p>
        <hr/>
        <p>BUT ALSO, to prevent undesirable full page load, Canon catch every <code className="bp3-code">&#x3C;a&#x3E;</code> tag with relative path and push a proper navitagion.</p>
        <p>You just can use:</p>
        <p><code className="bp3-code">&#x3C;a href=&#x22;/path/to/page&#x22;&#x3E;Go to page!&#x3C;/a&#x3E;</code></p>
        <p>Examples: <a href="/">Go to home</a>|<a href="/?test=true#test-hash">Go to home with get params and hash</a></p>
        <p>Your welcome!</p>
      </div>
    );
  }
}
