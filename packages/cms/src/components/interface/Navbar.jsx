import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {Icon} from "@blueprintjs/core";
import {hot} from "react-hot-loader/root";

import Dropdown from "./Dropdown";
import Select from "../fields/Select";
import Button from "../fields/Button";

import sectionIconLookup from "../../utils/sectionIconLookup";
import stripHTML from "../../utils/formatters/stripHTML";

import {setStatus} from "../../actions/status";

import "./Navbar.css";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settingsOpen: false,
      currEntity: null
    };
  }

  handleLocaleSelect(e) {
    const val = e.target.value;
    this.props.setStatus({
      localeSecondary: val === "none" ? null : val
    });
  }

  // manage settings menu visibility
  closeSettings() {
    this.setState({settingsOpen: false});
  }
  toggleSettings() {
    this.setState({settingsOpen: !this.state.settingsOpen});
  }

  // manage outline visibility
  toggleOutline() {
    this.setState({outlineOpen: !this.state.outlineOpen});
  }

  // TODO: edit profile title & metadata
  toggleEntitySettings() {
    console.log("TODO: edit entity settings");
  }

  getEntityId(id, tree) {
    const match = tree.find(t => t.id === id);
    return match;
  }

  makeTitleFromDimensions(entity) {
    return entity.meta.length
      ? entity.meta.map(m => m.slug).join(" / ")
      : "Unnamed ";
  }

  getNodeTitle(node) {
    const {localeDefault} = this.props.status;
    const localeContent = node.content.find(c => c.locale === localeDefault);

    let title = node.slug || "no title";
    if (localeContent) title = stripHTML(localeContent.title);
    return title;
  }

  render() {
    const {auth, currentTab, onTabChange, profiles, stories} = this.props;
    const {currentNode, currentPid, locales, localeDefault, localeSecondary} = this.props.status;
    const {settingsOpen, outlineOpen} = this.state;

    let tree = [];
    if (currentTab === "profiles") tree = profiles;
    if (currentTab === "stories") tree = stories;

    let currEntity, currTree;
    if (currentTab === "metadata") currEntity = "metadata"; // done

    if (currentTab === "profiles") {
      currEntity = "profile";
      let currProfile;
      if (currentPid) currProfile = this.getEntityId(currentPid, profiles);
      if (typeof currProfile === "object") {
        // profile title
        currEntity = this.makeTitleFromDimensions(currProfile);
        // sections
        currTree = currProfile.sections;
      }
    }
    // TODO: match profiles for stories
    if (currentTab === "stories") {
      currEntity = "story";
    }

    // genrate list of items to render in nav dropdowns
    const profileNavItems = [], storyNavItems = [];
    if (profiles.length) {
      profiles.map((profile, i) => {
        profileNavItems[i] = {
          // get the profile title, or generate it from dimensions
          title: this.getNodeTitle(profile).toString() !== "New Profile"
            ? this.getNodeTitle(profile)
            : this.makeTitleFromDimensions(profile),
          // TODO: change url, for obvious reasons. ProfileBuilder handleNodeClick logic?
          url: `/?tab=profiles&profile=${profiles[i].id}`
        };
      });
    }

    const navLinks = [
      {title: "profiles", items: profileNavItems, dropdown: true},
      {title: "stories",  items: [], dropdown: true},
      {title: "metadata"}
    ];

    console.log(profileNavItems);

    // console.log(currTree);
    // console.log(currentPid);
    // console.log(currentNode);

    // console.log(this.props.status);

    const showLocales = locales;
    const showAccount = auth.user;
    const settingsAvailable = showLocales || showAccount;

    return (
      <nav className={`cms-navbar${settingsOpen ? " settings-visible" : ""}`}>
        {/* title */}
        <div className="cms-navbar-title">
          {currEntity === "metadata" || !currentNode
            // metadata; render as h1 with no controls
            ? <h1 className="cms-navbar-title-heading u-font-lg">
              {currEntity === "metadata" ? "Metadata editor" : `Choose a ${currEntity}`}
            </h1>
            // profile/story; render as button to collapse outline
            : <Fragment>
              <button
                className="cms-navbar-title-button heading u-font-lg"
                onClick={() => this.toggleOutline()}
                aria-pressed={outlineOpen}
              >
                <Icon className="cms-navbar-title-button-icon" icon="caret-down" />
                <span className="cms-navbar-title-button-text">
                  {currEntity} {currentTab === "profiles" ? "profile" : ""}
                </span>
              </button>
              <button className="cms-navbar-entity-settings-button" onClick={() => this.toggleEntitySettings(currEntity)}>
                <span className="u-visually-hidden">edit {currEntity} metadata</span>
                <Icon className="cms-navbar-entity-settings-button-icon" icon="cog" />
              </button>
            </Fragment>
          }
        </div>

        {/* list of links */}
        <ul className="cms-navbar-list">
          {navLinks.map((navLink, i) =>
            navLink.dropdown && Array.isArray(navLink.items) && navLink.items.length
              // render a dropdown
              ? <Dropdown
                title={navLink.title}
                items={navLink.items}
              />
              // render a single link
              : <li className="cms-navbar-item" key={navLink.title}>
                <button
                  className={`cms-navbar-link u-font-xs${navLink.title === currentTab ? " is-active" : ""}`}
                  onClick={() => onTabChange(navLink.title)}
                  onFocus={() => settingsAvailable && settingsOpen && i === navLinks.length - 1 ? this.closeSettings() : null}
                >
                  {navLink.title}
                </button>
              </li>
          )}
        </ul>

        {/* settings menu & overlay */}
        {settingsAvailable
          ? <div className="cms-navbar-settings-wrapper">
            <div className="cms-navbar-settings-button-container">
              <Button
                className="cms-navbar-settings-button"
                id="cms-navbar-settings-button"
                namespace="cms"
                icon="cog"
                fontSize="xs"
                active={settingsOpen}
                onClick={() => this.toggleSettings()}
                aria-label={settingsOpen ? "View settings menu" : "Hide settings menu"}
              >
                settings
              </Button>
            </div>

            <div className={`cms-navbar-settings ${settingsOpen ? "is-visible" : "is-hidden"}`}>
              {/* locale select */}
              {showLocales && <Fragment>
                <h2 className="cms-navbar-settings-heading u-font-sm">
                  Languages
                </h2>
                {/* primary locale */}
                {/* NOTE: currently just shows the primary locale in a dropdown */}
                <Select
                  label="Primary"
                  fontSize="xs"
                  namespace="cms"
                  inline
                  options={[localeDefault]}
                  tabIndex={settingsOpen ? null : "-1"}
                />
                {/* secondary locale */}
                <Select
                  label="Secondary"
                  fontSize="xs"
                  namespace="cms"
                  inline
                  value={localeSecondary ? localeSecondary : "none"}
                  onChange={e => this.handleLocaleSelect(e)}
                  tabIndex={settingsOpen ? null : "-1"}
                >
                  <option value="none">none</option>
                  {locales.map(locale =>
                    <option value={locale} key={locale}>{locale}</option>
                  )}
                </Select>
              </Fragment>}

              {showAccount && <Fragment>
                <h2 className="cms-navbar-settings-heading u-font-sm u-margin-top-md">
                  Account
                </h2>
                <a className="cms-button cms-fill-button u-margin-bottom-xs" href="/auth/logout">
                  <Icon className="cms-button-icon" icon="log-out" />
                  <span className="cms-button-text">Log Out</span>
                </a>
              </Fragment>}
            </div>
            <button
              className={`cms-navbar-settings-overlay ${settingsOpen ? "is-visible" : "is-hidden"}`}
              onClick={() => this.toggleSettings()}
              onFocus={() => this.closeSettings()}
              aria-labelledby="cms-navbar-settings-button"
              tabIndex={settingsOpen ? null : "-1"}
            />
          </div> : ""
        }

        {currTree &&
          <ul className="cms-outline">
            {currTree.map(node =>
              <li className="cms-outline-item" key={node.id}>
                <button
                  className={`cms-outline-button${node.id === currentNode.data.id ? " is-active" : ""}`}
                  onClick={() => console.log(`${node.id} clicked`)}
                >
                  <Icon icon={sectionIconLookup(node.type, node.position)} />
                  {this.getNodeTitle(node)}
                </button>
              </li>
            )}
          </ul>
        }
      </nav>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  status: state.cms.status,
  profiles: state.cms.profiles,
  stories: state.cms.stories
});

const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(setStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(Navbar));
