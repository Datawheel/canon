import React, {Component, Fragment} from "react";
import {EditableText, Icon} from "@blueprintjs/core";
import "./Header.css";

export default class Header extends Component {

  renameSectionSlug(value) {
    console.log(value);
  }

  render() {
    const {
      dimensions,
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
      .map(dim => `${dim.slug}/${dim.memberSlug || dim.id}/`)
      .reduce((acc, d) => acc += d, "")
    }`;

    return (
      <header className="cms-header">
        <span className="cms-header-link-container">
          {dimensions && dimensions.length
            // proper URL can be constructed
            ? <a href={previewURL} className={`cms-header-link ${previewURL.length > 60 ? "u-font-xs" : ""}`}>
              <Icon className="cms-header-link-icon" icon="link" key="cms-header-link-icon" />
              {/* dimensions & ids */}
              {prettyDomain}/profile{dimensions && dimensions.map(dim =>
                <Fragment key={dim.slug}>/
                  <span className="cms-header-link-dimension">{dim.slug}</span>/
                  <span className="cms-header-link-id">{dim.memberSlug || dim.id}</span>
                </Fragment>
              )}
            </a>
            // show the domain, but that's it
            : `${prettyDomain}/profile/`
          }

          {/* edit slug button can't be part of link */}
          {slug && dimensions && dimensions.length
            ? <Fragment>#
              <span className="cms-header-link-slug">
                <EditableText
                  defaultValue={slug}
                  confirmOnEnterKey={true}
                  onConfirm={this.renameSectionSlug.bind(this)}
                />
                <Icon icon="edit" />
              </span>
            </Fragment> : ""
          }
        </span>
      </header>
    );
  }
}
