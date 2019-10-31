import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {Icon} from "@blueprintjs/core";
import {hot} from "react-hot-loader/root";

import Select from "../fields/Select";
import Button from "../fields/Button";

import stripHTML from "../../utils/formatters/stripHTML";

import {setStatus} from "../../actions/status";

import "./Navbar.css";

class Navbar extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      settingsOpen: false
    };
  }

  handleLocaleSelect(e) {
    const val = e.target.value;
    this.props.setStatus({
      localeSecondary: val === "none" ? null : val
    });
  }
  
  // callback function for setting settingsOpen to false
  onSettingsClose() {
    this.setState({settingsOpen: false});
  }

  // callback function for maintaining settingsOpen
  onSettingsToggle() {
    this.setState({settingsOpen: !this.state.settingsOpen}); 
  }

  onOutlineToggle() {}      // callback function for maintaining outlineOpen
  onOpenEntitySettings() {} // callback function for editing entity metadata
  outlineOpen() {}         // whether the profile/story outline is open or not

  render() {

    const {auth, currentTab, onTabChange, profiles, stories} = this.props;
    const {locales, localeDefault, localeSecondary} = this.props.status;
    const {settingsOpen, currEntity, outlineOpen} = this.state;

    const navLinks = [
      {title: "profiles", items: []},
      {title: "stories",  items: []},
      {title: "metadata"}
    ];

    let tree = [];
    if (currentTab === "profiles") tree = profiles;
    if (currentTab === "stories") tree = stories;

    const showConsole = false;

    if (showConsole && currentTab === "profiles") {
      tree.forEach(profile => {
        console.log("Profile Name: ", profile.meta.map(m => m.slug).join("_"));
        const sections = profile.sections.map(section => {
          let title = section.slug;
          const defaultContent = section.content.find(c => c.locale === localeDefault);
          if (defaultContent) title = stripHTML(defaultContent.title);
          return title;
        }).join();
        console.log("Has these sections:", sections);
        console.log("--------");
      });
    }
    
    const showLocales = locales;
    const showAccount = auth.user;
    const settingsAvailable = showLocales || showAccount;

    return (
      <nav className={`cms-navbar${settingsOpen ? " settings-visible" : ""}`}>
        {/* title */}
        <div className="cms-navbar-title">
          {currEntity === "metadata"
            // metadata; render as h1 with no controls
            ? <h1 className="cms-navbar-title-heading u-font-lg">Metadata editor</h1>
            // profile/story; render as button to collapse outline
            : <Fragment>
              <button
                className="cms-navbar-title-button heading u-font-lg"
                onClick={() => this.onOutlineToggle()}
                aria-pressed={outlineOpen}
              >
                <Icon className="cms-navbar-title-button-icon" icon="caret-down" />
                <span className="cms-navbar-title-button-text">
                  {currEntity} {currentTab === "profiles" ? "profile" : "story"}
                </span>
              </button>
              <button className="cms-navbar-entity-settings-button" onClick={() => this.onOpenEntitySettings(currEntity)}>
                <span className="u-visually-hidden">edit {currEntity} metadata</span>
                <Icon className="cms-navbar-entity-settings-button-icon" icon="cog" />
              </button>
            </Fragment>
          }
        </div>

        {/* list of links */}
        <ul className="cms-navbar-list">
          {navLinks.map((navLink, i) =>
            <li className="cms-navbar-item" key={navLink.title}>
              <button
                className={`cms-navbar-link u-font-xs${navLink.title === currentTab ? " is-active" : ""}`}
                onClick={() => onTabChange(navLink.title)}
                onFocus={() => settingsAvailable && settingsOpen && i === navLinks.length - 1 ? this.onSettingsClose() : null}
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
                onClick={this.onSettingsToggle.bind(this)}
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
                  options={locales.map(locale => locale)}
                  onChange={this.handleLocaleSelect.bind(this)}
                  tabIndex={settingsOpen ? null : "-1"}
                >
                  <option value="none">none</option>
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
              onClick={this.onSettingsToggle.bind(this)}
              onFocus={this.onSettingsClose.bind(this)}
              aria-labelledby="cms-navbar-settings-button"
              tabIndex={settingsOpen ? null : "-1"}
            />
          </div> : ""
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
