import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {hot} from "react-hot-loader/root";
import {Icon} from "@blueprintjs/core";

import Button from "../fields/Button";
import "./Header.css";

class Header extends Component {

  deleteProfile(pid) {
    console.log(pid);
  }
  deleteSection(entity, pid, sectionId) {
    console.log("entity", entity);
    console.log("pid", pid);
    console.log("sectionId", sectionId);
  }

  render() {
    const {dimensions, slug} = this.props;
    const {currentPid, pathObj} = this.props.status;

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
        <span className="cms-header-link-container" key="header-link-container">
          {dimensions && dimensions.length
            // proper profile URL can be constructed
            ? <a href={previewURL} className={`cms-header-link ${previewURL.length > 60 ? "u-font-xs" : ""}`} key="link">
              <Icon className="cms-header-link-icon" icon="link" key="cms-header-link-icon" />
              {/* dimensions & ids */}
              {prettyDomain}/profile{dimensions && dimensions.map(dim =>
                <Fragment key={dim.slug}>/
                  <span className="cms-header-link-dimension">{dim.slug}</span>/
                  <span className="cms-header-link-id">{dim.memberSlug || dim.id}</span>
                </Fragment>
              )}

              {/* slug (not used by profiles) */}
              {slug &&
                <Fragment key="slug">#
                  <span className="cms-header-link-slug">
                    {slug}
                  </span>
                </Fragment>
              }
            </a>
            // show the domain, but that's it
            : `${prettyDomain}/profile/`
          }
        </span>

        {/* delete entity */}
        {/* TODO: make this a popover once we have more options */}
        {currentPid && pathObj &&
          <div className="header-actions-container" key="header-actions-container">
            <Button
              onClick={pathObj.tab === "profiles"
                ? !pathObj.section
                  ? this.deleteProfile(currentPid)
                  : this.deleteSection("profile", currentPid, pathObj.section)
                // stories (TODO)
                : null}
              icon="trash"
              namespace="cms"
              fontSize="xs"
            >
              Delete {pathObj.section ? "section" : "profile"}
            </Button>
          </div>
        }
      </header>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status
});

export default connect(mapStateToProps)(hot(Header));
