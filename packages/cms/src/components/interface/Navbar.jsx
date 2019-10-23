import React, {Component, Fragment} from "react";
import {Icon} from "@blueprintjs/core";
import {hot} from "react-hot-loader/root";

import Select from "../fields/Select";
import Button from "../fields/Button";

import "./Navbar.css";

class Navbar extends Component {
  render() {
    const {
      currentTab,           // which navLink is active
      currEntity,           // which entity are we on (profile/story)
      navLinks,             // array of links
      onTabChange,          // callback function for switching tabs
      onSettingsToggle,     // callback function for maintaining settingsOpen
      onOutlineToggle,      // callback function for maintaining outlineOpen
      onOpenEntitySettings, // callback function for editing entity metadata
      onLocaleSelect,       // callback function for changing the secondary locale
      outlineOpen,          // whether the profile/story outline is open or not
      settings,             // object containing available settings objects (account, locales)
      settingsOpen          // whether the settings menu is open or not
    } = this.props;

    const settingsAvailable = Object.keys(settings).length;
    const {account, locales} = settings;

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
                onClick={() => onOutlineToggle()}
                aria-pressed={outlineOpen}
              >
                <Icon className="cms-navbar-title-button-icon" icon="caret-down" />
                {currEntity} {currentTab === "profiles" ? "profile" : "story"}
              </button>
              <button className="cms-navbar-entity-settings-button" onClick={() => onOpenEntitySettings(currEntity)}>
                <span className="u-visually-hidden">edit {currEntity} metadata</span>
                <Icon icon="cog" />
              </button>
            </Fragment>
          }
        </div>

        {/* list of links */}
        <ul className="cms-navbar-list">
          {navLinks.map(navLink =>
            <li className="cms-navbar-item" key={navLink.title}>
              <button
                className={`cms-navbar-link u-font-xs${navLink.title === currentTab ? " is-active" : ""}`}
                onClick={() => onTabChange(navLink.title)}
              >
                {navLink.title}
              </button>
            </li>
          )}
        </ul>

        {/* settings menu & overlay */}
        {settingsAvailable
          ? <Fragment>
            <div className="cms-navbar-settings-button-container">
              <Button
                className="cms-navbar-settings-button"
                namespace="cms"
                icon="cog"
                fontSize="xs"
                active={settingsOpen}
                onClick={() => onSettingsToggle()}
              >
                settings
              </Button>
            </div>

            <div className={`cms-navbar-settings ${settingsOpen ? "is-visible" : "is-hidden"}`}>
              {/* locale select */}
              {locales &&
                <Fragment>
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
                    options={[locales.primaryLocale]}
                    tabIndex={settingsOpen ? null : "-1"}
                  />
                  {/* secondary locale */}
                  <Select
                    label="Secondary"
                    fontSize="xs"
                    namespace="cms"
                    inline
                    options={locales.availableLocales.map(locale => locale)}
                    onChange={e => onLocaleSelect(e)}
                    tabIndex={settingsOpen ? null : "-1"}
                  >
                    <option value="none">none</option>
                  </Select>
                </Fragment>
              }
              {account &&
                <Fragment>
                  <h2 className="cms-navbar-settings-heading u-font-sm u-margin-top-md">
                    Account
                  </h2>
                  <a className="cms-button cms-fill-button u-margin-bottom-xs" href="/auth/logout">
                    <Icon className="cms-button-icon" icon="log-out" />
                    <span className="cms-button-text">Log Out</span>
                  </a>
                </Fragment>
              }
            </div>
            <button
              className={`cms-navbar-settings-overlay ${settingsOpen ? "is-visible" : "is-hidden"}`}
              onClick={() => onSettingsToggle()}
              tabIndex={settingsOpen ? null : "-1"}
            />
          </Fragment> : ""
        }
      </nav>
    );
  }
}

export default hot(Navbar);
