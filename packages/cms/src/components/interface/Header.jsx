import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {Icon, Intent} from "@blueprintjs/core";

import Button from "../fields/Button";
import ButtonGroup from "../fields/ButtonGroup";
import Select from "../fields/Select";
import Alert from "../interface/Alert";

import {deleteEntity, deleteProfile, duplicateProfile, duplicateSection, translateSection, translateProfile, fetchSectionPreview} from "../../actions/profiles";
import {deleteStory} from "../../actions/stories";
import {setStatus} from "../../actions/status";

import PropTypes from "prop-types";
import linkify from "../../utils/linkify";

import "./Header.css";

// spread into header action buttons
const buttonProps = {
  iconPosition: "left",
  namespace: "cms",
  fontSize: "xxs"
};

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemToDelete: null,
      itemToDuplicate: null,
      itemToTranslate: null
    };
  }

  componentDidUpdate(prevProps) {
    const translationFinished = prevProps.status.translationCounter !== this.props.status.translationCounter;
    if (translationFinished) {
      const {translationError} = this.props.status;
      const Toast = this.context.toast.current;
      if (translationError) {
        Toast.show({icon: "error", intent: Intent.DANGER, message: `Translation Failed: ${translationError}`, timeout: 5000});
      }
      else {
        Toast.show({icon: "saved", intent: Intent.SUCCESS, message: "Translation Complete!", timeout: 2500});
      }
    }
  }

  maybeTranslate() {
    const {pathObj} = this.props.status;
    if (pathObj.tab === "profiles") {
      const type = pathObj.section ? "section" : pathObj.profile ? "profile" : null;
      const id = pathObj.section ? Number(pathObj.section) : pathObj.profile ? Number(pathObj.profile) : null;
      if (type && id) {
        this.setState({itemToTranslate: {type, id}});
      }
    }
    else if (pathObj.tab === "stories") {
      const type = pathObj.storysection ? "storysection" : pathObj.story ? "story" : null;
      const id = pathObj.storysection ? Number(pathObj.storysection) : pathObj.story ? Number(pathObj.story) : null;
      if (type && id) {
        this.setState({itemToTranslate: {type, id}});
      }
    }
  }

  translate(itemToTranslate) {
    const {id, type} = itemToTranslate;
    const {localeDefault, localeSecondary} = this.props.status;
    const variables = this.props.variables && this.props.variables[localeDefault] ? this.props.variables[localeDefault] : {};
    if (localeSecondary) {
      if (type === "profile") {
        const Toast = this.context.toast.current;
        Toast.show({icon: "translate", intent: Intent.WARNING, message: "Translating profile...", timeout: 1000});
        this.props.translateProfile(id, variables, localeDefault, localeSecondary);
      }
      if (type === "section") {
        const Toast = this.context.toast.current;
        Toast.show({icon: "translate", intent: Intent.WARNING, message: "Translating section...", timeout: 1000});
        this.props.translateSection(id, variables, localeDefault, localeSecondary);
      }
    }
    this.setState({itemToTranslate: null});
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

  togglePreview() {
    const {pathObj, localeDefault, localeSecondary, useLocaleSecondary} = this.props.status;
    const locale = useLocaleSecondary ? localeSecondary : localeDefault;
    if (pathObj.section) {
      this.props.fetchSectionPreview(pathObj.section, locale);
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
    const {currentPid, currentStoryPid, pathObj, localeDefault, localeSecondary} = this.props.status;
    const {itemToDelete, itemToDuplicate, itemToTranslate, profileTarget} = this.state;
    const {router} = this.context;

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
      previewURL = linkify(router, dimensions, localeDefault);
      prettyURL = `${prettyRoot}${previewURL}`;
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

    const showDuplicateButton = pathObj.tab === "profiles";
    const showPreviewButton = pathObj.section;
    const showTranslateButton = (pathObj.profile || pathObj.section) && localeSecondary;

    const showButtons = showDuplicateButton || showDeleteButton || showPreviewButton;

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
          {showButtons
            ? <div className="cms-header-actions-container" key="ac">
              <ButtonGroup className="cms-header-actions-button-group">
                {/* translate entity */}
                {showTranslateButton &&
                  <Button
                    className="cms-header-actions-button cms-header-translate-button"
                    onClick={this.maybeTranslate.bind(this)}
                    icon="translate"
                    key="t1"
                    {...buttonProps}
                  >
                    Translate <span className="u-visually-hidden">section</span>
                  </Button>
                }
                {/* preview entity */}
                {showPreviewButton &&
                  <Button
                    className="cms-header-actions-button cms-header-preview-button"
                    onClick={this.togglePreview.bind(this)}
                    icon="application"
                    key="db1"
                    {...buttonProps}
                  >
                    Preview <span className="u-visually-hidden">section</span>
                  </Button>
                }
                {/* duplicate entity */}
                {showDuplicateButton &&
                  <Button
                    className="cms-header-actions-button cms-header-duplicate-button"
                    onClick={this.maybeDuplicate.bind(this)}
                    icon="duplicate"
                    key="db2"
                    {...buttonProps}
                  >
                    Duplicate <span className="u-visually-hidden">
                      {entityType === "storysection" ? "section" : entityType}
                    </span>
                  </Button>
                }
                {/* delete entity */}
                {showDeleteButton &&
                  <Button
                    className="cms-header-actions-button cms-header-delete-button"
                    onClick={this.maybeDelete.bind(this)}
                    icon="trash"
                    key="db3"
                    {...buttonProps}
                  >
                    Delete <span className="u-visually-hidden">
                      {entityType === "storysection" ? "section" : entityType}
                    </span>
                  </Button>
                }
              </ButtonGroup>
            </div> : ""
          }
        </header>

        {/* duplicate alert */}
        <Alert
          title={`Duplicate ${entityType}?`}
          isOpen={itemToDuplicate}
          confirmButtonText={`Duplicate ${entityType}`}
          onConfirm={() => this.duplicate.bind(this)(itemToDuplicate)}
          onCancel={() => this.setState({itemToDuplicate: null})}
          controls={entityType === "section"
            ? <Select
              label="Duplicate section to which profile?"
              labelHidden
              namespace="cms"
              fontSize="md"
              value={profileTarget}
              onChange={this.chooseProfileTarget.bind(this)}
            >
              {profiles.map(p => <option key={p.id} value={p.id}>
                {p.meta.map(m => m.slug).join("/")} profile
              </option>)}
            </Select> : null
          }
          theme="caution"
        />

        {/* delete alert */}
        <Alert
          title={itemToDelete && itemToDelete.type === "profile"
            ? "Delete profile along with all of its sections and content?"
            : "Delete section along with all of its content?"}
          isOpen={itemToDelete}
          cancelButtonText="Cancel"
          confirmButtonText={`Delete ${itemToDelete ? itemToDelete.type : ""}`}
          onConfirm={() => this.delete.bind(this)(itemToDelete)}
          onCancel={() => this.setState({itemToDelete: null})}
          description="This action cannot be undone."
        />
        {/* translate alert */}
        <Alert
          title={`Translate ${itemToTranslate ? itemToTranslate.type : ""}? This will overwrite ALL current translations, and costs $`}
          isOpen={itemToTranslate}
          cancelButtonText="Cancel"
          confirmButtonText={`Translate ${itemToTranslate ? itemToTranslate.type : ""}`}
          onConfirm={() => this.translate.bind(this)(itemToTranslate)}
          onCancel={() => this.setState({itemToTranslate: null})}
          description="This action cannot be undone."
        />
      </Fragment>
    );
  }
}

Header.contextTypes = {
  router: PropTypes.object,
  toast: PropTypes.object
};

const mapStateToProps = state => ({
  status: state.cms.status,
  variables: state.cms.variables,
  profiles: state.cms.profiles,
  stories: state.cms.stories
});

const mapDispatchToProps = dispatch => ({
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  deleteProfile: id => dispatch(deleteProfile(id)),
  duplicateProfile: id => dispatch(duplicateProfile(id)),
  duplicateSection: (id, pid) => dispatch(duplicateSection(id, pid)),
  translateSection: (id, variables, source, target) => dispatch(translateSection(id, variables, source, target)),
  translateProfile: (id, variables, source, target) => dispatch(translateProfile(id, variables, source, target)),
  fetchSectionPreview: (id, locale) => dispatch(fetchSectionPreview(id, locale)),
  deleteStory: id => dispatch(deleteStory(id)),
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
