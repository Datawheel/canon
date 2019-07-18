import React, {Component} from "react";
import {EditableText, Icon} from "@blueprintjs/core";
import Button from "../fields/Button";
import "./Header.css";

export default class Header extends Component {

  nicknameProfile(value) {
    console.log(value);
  }

  renameSectionSlug(value) {
    console.log(value);
  }

  renameSection() {
    console.log("button clicked");
  }

  render() {
    const {
      parentTitle,
      dimensions,
      title,
      slug
    } = this.props;

    let domain = this.props;
    if (typeof domain !== "undefined" && typeof window !== "undefined" && window.document.location.origin) {
      domain = window.document.location.origin;
    }
    else {
      if (typeof domain !== "undefined" && typeof window !== "undefined") {
        domain = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`;
      }
    }

    const prettyDomain = domain.replace("http://", "").replace("https://", "");

    // construct URL from domain and dimensions
    const previewURL = `${domain}/profile/${dimensions
      .map(dim => Object.values(dim)) // extract each dimension key & value into an array
      .reduce((acc, val) => acc.concat(val), []) // flatten arrays
      .join("/") // now it's a URL
    }${typeof slug !== "undefined" ? `#${slug}` : ""}`;

    return (
      <header className="cms-header">
        <h1 className="cms-header-title u-font-lg">
          {!parentTitle

            // profile
            ? <span className="cms-header-title-main">
              <EditableText
                defaultValue={title}
                confirmOnEnterKey={true}
                onConfirm={this.nicknameProfile.bind(this)}
              />
              <Icon icon="edit" />
            </span>

            // section
            : <React.Fragment>
              <span className="cms-header-title-parent">{parentTitle} </span>
              <span className="cms-header-title-main">
                {title}
                <Button className="cms-header-title-button u-font-xs" context="cms" onClick={this.renameSection.bind(this)} icon="cog" iconOnly>
                  rename section
                </Button>
              </span>
            </React.Fragment>
          }
        </h1>

        <span className="cms-header-link-container">
          {dimensions && dimensions.length
            // proper URL can be constructed
            ? <a href={previewURL} className={`cms-header-link ${previewURL.length > 60 ? "u-font-xs" : ""}`}>
              {/* dimensions & ids */}
              {prettyDomain}/profile{dimensions && dimensions.map(dim =>
                <React.Fragment key={dim.slug}>/
                  <span className="cms-header-link-dimension">{dim.slug}</span>/
                  <span className="cms-header-link-id">{dim.id}</span>
                </React.Fragment>
              )}
            </a>
            // show the domain, but that's it
            : `${prettyDomain}/profile/`
          }

          {/* edit slug button can't be part of link */}
          {slug && dimensions && dimensions.length
            ? <React.Fragment>#
              <span className="cms-header-link-slug">
                <EditableText
                  defaultValue={slug}
                  confirmOnEnterKey={true}
                  onConfirm={this.renameSectionSlug.bind(this)}
                />
                <Icon icon="edit" />
              </span>
            </React.Fragment> : ""
          }
        </span>
      </header>
    );
  }
}
