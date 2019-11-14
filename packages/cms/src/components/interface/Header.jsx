import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {hot} from "react-hot-loader/root";
import {Icon, Alert, Intent} from "@blueprintjs/core";

import Button from "../fields/Button";

import {deleteEntity, deleteProfile} from "../../actions/profiles";

import "./Header.css";

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      itemToDelete: null
    };
  }

  maybeDelete() {
    const {pathObj} = this.props.status;
    const type = pathObj.section ? "section" : pathObj.profile ? "profile" : null;
    const id = pathObj.section ? Number(pathObj.section) : pathObj.profile ? Number(pathObj.profile) : null;
    if (type && id) {
      this.setState({itemToDelete: {type, id}});
    }
  }

  delete(itemToDelete) {
    const {type, id} = itemToDelete;
    if (type === "section") this.props.deleteEntity("section", {id});
    if (type === "profile") this.props.deleteProfile(id);
    this.setState({itemToDelete: null});
  }

  render() {

    const {dimensions, slug, profiles} = this.props;
    const {currentPid, pathObj} = this.props.status;
    const {itemToDelete} = this.state;

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

    let showDeleteButton = false;
    // Only show the delete button if this is not the last entity. You can't have a profile with no sections.
    if (pathObj.section) {
      const thisProfile = profiles.find(p => p.id === currentPid);
      if (thisProfile && thisProfile.sections.length > 1) showDeleteButton = true;
    }
    else if (pathObj.profile) {
      showDeleteButton = profiles.length > 1;
    }

    return (
      <React.Fragment>
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
          {currentPid && showDeleteButton && 
            <div className="header-actions-container" key="header-actions-container">
              <Button
                onClick={this.maybeDelete.bind(this)}
                icon="trash"
                namespace="cms"
                fontSize="xs"
              >
                Delete {pathObj.section ? "section" : "profile"}
              </Button>
            </div>
          }
        </header>
        <Alert
          isOpen={itemToDelete}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          iconName="trash"
          intent={Intent.DANGER}
          onConfirm={() => this.delete.bind(this)(itemToDelete)}
          onCancel={() => this.setState({itemToDelete: null})}
        >
          {itemToDelete ? `Are you sure you want to delete this ${itemToDelete.type} and all its children? This action cannot be undone.` : ""}
        </Alert>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status,
  profiles: state.cms.profiles
});

const mapDispatchToProps = dispatch => ({
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  deleteProfile: id => dispatch(deleteProfile(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(Header));
