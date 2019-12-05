import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {hot} from "react-hot-loader/root";
import {Icon, Alert, Intent} from "@blueprintjs/core";

import Button from "../fields/Button";
import Select from "../fields/Select";

import {deleteEntity, deleteProfile, duplicateProfile, duplicateSection} from "../../actions/profiles";
import {deleteStory} from "../../actions/stories";

import "./Header.css";

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      itemToDelete: null,
      itemToDuplicate: null
    };
  }

  maybeDuplicate() {
    const {pathObj, currentPid} = this.props.status;
    if (pathObj.tab === "profiles") {
      const type = pathObj.section ? "section" : pathObj.profile ? "profile" : null;
      const id = pathObj.section ? Number(pathObj.section) : pathObj.profile ? Number(pathObj.profile) : null;
      if (type && id) {
        this.setState({itemToDuplicate: {type, id}, profileTarget: currentPid});
      }
    }
    else if (pathObj.tab === "stories") {
      const type = pathObj.storysection ? "storysection" : pathObj.story ? "story" : null;
      const id = pathObj.storysection ? Number(pathObj.storysection) : pathObj.story ? Number(pathObj.story) : null;
      if (type && id) {
        this.setState({itemToDuplicate: {type, id}});
      }
    }
  }

  duplicate(itemToDuplicate) {
    const {type, id} = itemToDuplicate;
    const {profileTarget} = this.state;
    if (type === "profile") this.props.duplicateProfile(id);
    if (type === "section") this.props.duplicateSection(id, profileTarget);
    this.setState({itemToDuplicate: null});
  }

  maybeDelete() {
    const {pathObj} = this.props.status;
    if (pathObj.tab === "profiles") {
      const type = pathObj.section ? "section" : pathObj.profile ? "profile" : null;
      const id = pathObj.section ? Number(pathObj.section) : pathObj.profile ? Number(pathObj.profile) : null;
      if (type && id) {
        this.setState({itemToDelete: {type, id}});
      }
    }
    else if (pathObj.tab === "stories") {
      const type = pathObj.storysection ? "storysection" : pathObj.story ? "story" : null;
      const id = pathObj.storysection ? Number(pathObj.storysection) : pathObj.story ? Number(pathObj.story) : null;
      if (type && id) {
        this.setState({itemToDelete: {type, id}});
      }
    }
  }

  delete(itemToDelete) {
    const {type, id} = itemToDelete;
    if (type === "section") this.props.deleteEntity("section", {id});
    if (type === "profile") this.props.deleteProfile(id);
    if (type === "storysection") this.props.deleteEntity("storysection", {id});
    if (type === "story") this.props.deleteStory(id);
    this.setState({itemToDelete: null});
  }

  chooseProfileTarget(e) {
    this.setState({profileTarget: e.target.value});
  }

  render() {

    const {dimensions, profiles, stories} = this.props;
    const {currentPid, currentStoryPid, pathObj} = this.props.status;
    const {itemToDelete, itemToDuplicate, profileTarget} = this.state;

    let domain = this.props;
    if (typeof domain !== "undefined" && typeof window !== "undefined" && window.document.location.origin) {
      domain = window.document.location.origin;
    }
    else {
      if (typeof domain !== "undefined" && typeof window !== "undefined") {
        domain = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`;
      }
    }

    let entityType, prettyURL, previewURL, showDeleteButton, slug;
    const prettyRoot = domain.replace("http://", "").replace("https://", "");

    if (pathObj.tab === "profiles") {
      // construct URL from domain and dimensions
      previewURL = `${domain}/profile/${dimensions
        .map(dim => `${dim.slug}/${dim.memberSlug || dim.id}/`)
        .reduce((acc, d) => acc += d, "")
      }`;
      prettyURL = <Fragment>
        {prettyRoot}/profile{dimensions && dimensions.map(dim =>
          <Fragment key={dim.slug}>/
            <span className="cms-header-link-dimension">{dim.slug}</span>/
            <span className="cms-header-link-id">{dim.memberSlug || dim.id}</span>
          </Fragment>)}
      </Fragment>;
      // Only show the delete button if this is not the last entity. You can't have a profile with no sections.
      if (pathObj.section) {
        const thisProfile = profiles.find(p => p.id === currentPid);
        if (currentPid && thisProfile && thisProfile.sections.length > 1) showDeleteButton = true;
        if (thisProfile) {
          const thisSection = thisProfile.sections.find(s => s.id === Number(pathObj.section));
          if (thisSection) {
            slug = thisSection.slug;
            previewURL += `#${slug}`;
          }
        }
        entityType = "section";
      }
      else if (pathObj.profile) {
        showDeleteButton = currentPid && profiles.length > 1;
        entityType = "profile";
      }
    }
    else if (pathObj.tab === "stories") {
      previewURL = `${domain}/story/${pathObj.story}`;
      prettyURL = `${prettyRoot}/story/${pathObj.story}`;
      // Only show the delete button if this is not the last entity. You can't have a story with no storysections.
      if (pathObj.storysection) {
        const thisStory = stories.find(p => p.id === currentStoryPid);
        if (currentStoryPid && thisStory && thisStory.storysections.length > 1) showDeleteButton = true;
        if (thisStory) {
          const thisStorysection = thisStory.storysections.find(s => s.id === Number(pathObj.storysection));
          if (thisStorysection) {
            slug = thisStorysection.slug;
            previewURL += `#${slug}`;
          }
        }
        entityType = "storysection";
      }
      else if (pathObj.story) {
        showDeleteButton = currentStoryPid && stories.length > 1;
        entityType = "story";
      }
    }

    // Only show the link if this is a story (not requiring dimension) or is a profile that HAS dimensions
    const showLink = pathObj.tab === "stories" || dimensions && dimensions.length > 0;

    return (
      <Fragment>
        <header className="cms-header">
          <span className="cms-header-link-container" key="header-link-container">
            {showLink
              // proper profile URL can be constructed
              ? <a href={previewURL} className={`cms-header-link ${previewURL.length > 60 ? "u-font-xs" : ""}`} key="link">
                <Icon className="cms-header-link-icon" icon="link" key="cms-header-link-icon" />
                {/* dimensions & ids */}
                {prettyURL}

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
              : `${prettyRoot}/profile/`
            }
          </span>

          {/* TODO: make this a popover once we have more options */}
          {/* duplicate entity */}
          {pathObj.tab === "profiles" && <div className="cms-header-actions-container" key="header-actions-container-duplicate">
            <Button
              className="cms-header-actions-button cms-header-delete-button"
              onClick={this.maybeDuplicate.bind(this)}
              icon="duplicate"
              namespace="cms"
              fontSize="xs"
            >
              {`Duplicate ${entityType === "storysection" ? "section" : entityType}`}
            </Button>
          </div>}
          {/* delete entity */}
          {showDeleteButton &&
            <div className="cms-header-actions-container" key="header-actions-container-delete">
              <Button
                className="cms-header-actions-button cms-header-delete-button"
                onClick={this.maybeDelete.bind(this)}
                icon="trash"
                namespace="cms"
                fontSize="xs"
              >
                {`Delete ${entityType === "storysection" ? "section" : entityType}`}
              </Button>
            </div>
          }
        </header>

        <Alert
          isOpen={itemToDuplicate}
          cancelButtonText="Cancel"
          confirmButtonText="Duplicate"
          iconName="duplicate"
          intent={Intent.SUCCESS}
          onConfirm={() => this.duplicate.bind(this)(itemToDuplicate)}
          onCancel={() => this.setState({itemToDuplicate: null})}
        >
          {entityType === "profile" 
            ? <div>Duplicate this Profile?</div>
            : <div>
              Choose a profile in which to duplicate this section:
              <Select
                label="Target Profile"
                namespace="cms"
                value={profileTarget}
                onChange={this.chooseProfileTarget.bind(this)}
                inline
              >
                {profiles.map(p => <option key={p.id} value={p.id}>{p.meta.map(m => m.slug).join("/")}</option>)}
              </Select>
            </div>
          }
        </Alert>
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
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status,
  profiles: state.cms.profiles,
  stories: state.cms.stories
});

const mapDispatchToProps = dispatch => ({
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  deleteProfile: id => dispatch(deleteProfile(id)),
  duplicateProfile: id => dispatch(duplicateProfile(id)),
  duplicateSection: (id, pid) => dispatch(duplicateSection(id, pid)),
  deleteStory: id => dispatch(deleteStory(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(Header));
