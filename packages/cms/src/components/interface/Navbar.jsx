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
import "./Outline.css";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settingsOpen: false,
      navOpen: false,
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
  toggleNav() {
    this.setState({navOpen: !this.state.navOpen});
  }

  // manage outline visibility
  toggleOutline() {
    this.setState({outlineOpen: !this.state.outlineOpen});
  }

  getEntityId(id, tree) {
    const match = tree.find(t => t.id === id);
    return match;
  }

  makeTitleFromDimensions(entity) {
    return entity.meta.length
      ? entity.meta.map(m => m.slug).join(" / ")
      : "Unnamed";
  }

  getNodeTitle(node) {
    const {localeDefault} = this.props.status;
    const localeContent = node.content.find(c => c.locale === localeDefault);

    let title = node.slug || "no title";
    if (localeContent) title = stripHTML(localeContent.title);
    return title;
  }

  // TODO: add functionality
  toggleEntitySettings() {
    console.log("TODO: edit entity settings"); // edit profile title & metadata when clicking the profile gear button
  }
  createProfile() {
    console.log("TODO: create profile"); // create a new profile when clicking the button in the profile dropdown
  }
  createSection(id) {
    const {currentTab} = this.props;
    console.log(`TODO: add new ${currentTab} section after section ${id}`); // swap positioning of
  }
  swapSectionsPosition(id) {
    const {currentTab} = this.props;
    console.log(`TODO: move ${currentTab} section ${id} postion down/right by one`); // swap positioning of
  }

  render() {
    const {auth, currentTab, onTabChange, profiles, stories} = this.props;
    const {currentNode, currentPid, locales, localeDefault, localeSecondary} = this.props.status;
    const {outlineOpen, navOpen, settingsOpen} = this.state;

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
          url: `/?tab=profiles&profile=${profile.id}`,
          selected: currentTab === "profiles" && currentPid === profile.id
        };
      });
    }
    if (!profileNavItems.find(p => p.title === "Create new profile")) {
      profileNavItems.push({
        title: "Create new profile",
        icon: "plus",
        onClick: () => this.createProfile()
      });
    }

    // generate dropdowns for switching entities
    const navLinks = [
      {
        title: "Profiles",
        items: profileNavItems,
        selected: currentTab === "profiles" ? true : false,
        dropdown: true
      },
      {
        title: "Stories",
        items: [], // TODO
        selected: currentTab === "stories" ? true : false,
        dropdown: true
      },
      {title: "Metadata"}
    ];

    // console.log(currTree);
    // console.log(currentPid);
    // console.log(currentNode);
    // console.log(this.props.status);

    const showLocales = locales;
    const showAccount = auth.user;
    const settingsAvailable = showLocales || showAccount;

    return (
      <nav className={`cms-navbar${settingsOpen ? " settings-visible" : ""}`}>
        {/* main (top) top navbar */}
        <div className="cms-navbar-inner">
          {/* title */}
          <div className={`cms-navbar-title ${currentNode ? "with-node" : "without-node" }`}>
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
                    {currEntity}{currentTab === "profiles" ? " profile" : ""}
                  </span>
                </button>
                <button className="cms-navbar-entity-settings-button" onClick={() => this.toggleEntitySettings(currEntity)}>
                  <span className="u-visually-hidden">edit {currEntity} metadata</span>
                  <Icon className="cms-navbar-entity-settings-button-icon" icon="cog" />
                </button>
              </Fragment>
            }
          </div>

          {/* button for toggling visibility of the list of links on small screens */}
          <Button
            className="cms-navbar-list-toggle-button u-hide-above-sm"
            onClick={() => this.toggleNav()}
            namespace="cms"
            icon={navOpen ? "cross" : "menu"}
            fontSize="xs"
          >
            menu
          </Button>
          {/* list of links */}
          <ul className={`cms-navbar-list ${navOpen ? "is-open" : "is-closed"}`}>
            {navLinks.map((navLink, i) =>
              navLink.dropdown && Array.isArray(navLink.items) && navLink.items.length
                // render a dropdown
                ? <Dropdown
                  title={navLink.title}
                  items={navLink.items}
                  selected={navLink.selected}
                />
                // render a single link
                : <li className="cms-navbar-item" key={navLink.title}>
                  <button
                    className={`cms-navbar-link${navLink.title.toLowerCase() === currentTab ? " is-selected" : ""}`}
                    onClick={() => onTabChange(navLink.title.toLowerCase())}
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
        </div>

        {currTree &&
          <ul className="cms-outline">
            {currTree.map(node =>
              <li className="cms-outline-item" key={node.id}>
                <a
                  className={`cms-outline-link${
                    currentNode.itemType === "section" && node.id === currentNode.data.id
                      ? " is-selected" // current node
                      : ""
                  }`}
                  href={currentTab === "profiles"
                    ? `/?tab=profiles&profile=${currentPid}&section=${node.id}`
                    : "/?tab=stories" // TODO
                  }
                >
                  <Icon className="cms-outline-link-icon" icon={sectionIconLookup(node.type, node.position)} />
                  {this.getNodeTitle(node)}
                </a>

                {/* add section / swap section position buttons */}
                <div className="cms-outline-item-actions cms-button">
                  {/* add section */}
                  <Button
                    onClick={() => this.createSection(node.id)}
                    className="cms-outline-item-actions-button"
                    namespace="cms"
                    fontSize="xxs"
                    icon="plus"
                    iconOnly
                    key={`${node.id}-add-button`}
                  >
                    Add new section
                  </Button>
                  {/* swap section positions */}
                  <Button
                    onClick={() => this.swapSections(node.id)}
                    className="cms-outline-item-actions-button"
                    namespace="cms"
                    fontSize="xxs"
                    icon="swap-horizontal"
                    iconOnly
                    key={`${node.id}-swap-button`}
                  >
                    Swap positioning of current and next sections
                  </Button>
                </div>
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
