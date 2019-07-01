import React, {Component} from "react";
import Button from "../fields/Button";
import "./Header.css";

export default class Header extends Component {
  render() {
    const {
      onRenameTitle,
      onRenameSlug,
      parentTitle,
      dimensions,
      title,
      slug
    } = this.props;

    let domain = this.props;
    if (typeof domain !== "undefined" && typeof window !== "undefined") {
      domain = window.document.location.origin;
    }

    const prettyDomain = domain.replace("http://", "").replace("https://", "");

    // construct URL from domain and dimensions
    const previewURL = `${domain}/profile/${
      dimensions.map(dim => Object.values(dim)).flat().join("/")
    }${slug && `#${slug}`}`;

    return (
      <header className="cms-header">
        <h1 className="cms-header-title font-lg">
          {parentTitle &&
            <span className="cms-header-title-parent">{parentTitle} </span>
          }
          <span className="cms-header-title-main">
            {title}
            <Button className="cms-header-title-button font-xs" onClick={onRenameTitle} icon="edit" iconOnly>
              rename profile
            </Button>
          </span>
        </h1>

        <span className="cms-header-link-container">
          {dimensions && dimensions.length
            // proper URL can be constructed
            ? <a href={previewURL} className="cms-header-link">
              {/* dimensions & ids */}
              {prettyDomain}/profile{dimensions && dimensions.map(dim =>
                <React.Fragment key={dim.slug}>/
                  <span className="cms-header-link-dimension">{dim.slug}</span>/
                  <span className="cms-header-link-id">{dim.id}</span>
                </React.Fragment>
              )}
              {/* append slug */}
              {slug &&
                <React.Fragment>#
                  <span className="cms-header-link-slug">{slug}</span>
                </React.Fragment>
              }
            </a>
            // show the domain, but that's it
            : `${prettyDomain}/profile/`
          }

          {/* edit slug button can't be part of link */}
          {slug && dimensions && dimensions.length
            ? <Button className="cms-header-slug-button font-xs" onClick={onRenameSlug} icon="edit" iconOnly>
              rename slug
            </Button> : ""
          }
        </span>
      </header>
    );
  }
}
