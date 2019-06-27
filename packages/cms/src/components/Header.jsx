import React, {Component} from "react";
import Button from "./Button";
import "./Header.css";

export default class Header extends Component {
  render() {
    const {
      onRename,
      parentTitle,
      dimensions,
      title
    } = this.props;

    let domain = this.props;
    if (typeof domain !== "undefined" && typeof window !== "undefined") {
      domain = window.document.location.origin;
    }

    // construct URL from domain and dimensions
    const previewURL = `${domain}/profile/${
      dimensions.map(dim => Object.values(dim)).flat().join("/")
    }`;

    return (
      <header className="cms-header">
        <h1 className="cms-header-title font-lg">
          {parentTitle &&
            <span className="cms-header-title-parent">{parentTitle} </span>
          }
          <span className="cms-header-title-main">
            {title}
            <Button onClick={onRename} icon="edit" iconOnly>
              rename
            </Button>
          </span>
        </h1>

        <a href={previewURL} className="cms-header-link">
          {domain}/profile{dimensions && dimensions.map(dim =>
            <React.Fragment key={dim.slug}>
              /<span className="cms-header-link-dimension">
                {dim.slug}
              </span>/
              <span className="cms-header-link-id">
                {dim.id}
              </span>
            </React.Fragment>
          )}
        </a>
      </header>
    );
  }
}
