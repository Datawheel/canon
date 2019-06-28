import React, {Component} from "react";
import Button from "./Button";
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
            <Button onClick={onRenameTitle} icon="edit" iconOnly>
              rename
            </Button>
          </span>
        </h1>

        {dimensions && dimensions.length
          ? <a href={previewURL} className="cms-header-link">
            {prettyDomain}/profile{dimensions && dimensions.map(dim =>
              <React.Fragment key={dim.slug}>
                /<span className="cms-header-link-dimension">
                  {dim.slug}
                </span>/
                <span className="cms-header-link-id">
                  {dim.id}
                </span>
              </React.Fragment>
            )}{slug &&
              <React.Fragment>
                #<span className="cms-header-link-slug">
                  {slug}
                </span>
                <Button onClick={onRenameSlug} icon="edit" iconOnly>
                  rename
                </Button>
              </React.Fragment>
            }
          </a>
          : <span className="cms-header-link">
            {prettyDomain}/profile/
          </span>
        }
      </header>
    );
  }
}
