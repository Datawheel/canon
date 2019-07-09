import funcifyFormatterByLocale from "./utils/funcifyFormatterByLocale";
import React, {Component} from "react";
import PropTypes from "prop-types";
import Select from "./components/fields/Select";
import ProfileBuilder from "./profile/ProfileBuilder";
import StoryBuilder from "./story/StoryBuilder";
import {fetchData} from "@datawheel/canon-core";
import {connect} from "react-redux";

import Button from "./components/fields/Button";

import "./css/base.css";
import "./css/blueprint-overrides.css";
import "./css/form-fields.css";
import "./css/layout.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "profiles",
      locales: false,
      localeDefault: false,
      secondaryLocale: false,
      pathObj: {},
      formatters: {}
    };
  }

  componentDidMount() {
    const {isEnabled, env, location} = this.props;
    const {profile, section, previews} = location.query;
    // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
    if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
    const pathObj = {profile, section, previews};

    // Retrieve the langs from canon vars, use it to build the second language select dropdown.
    const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
    const formatters = {};
    formatters[localeDefault] = funcifyFormatterByLocale(this.props.formatters, localeDefault);
    if (env.CANON_LANGUAGES && env.CANON_LANGUAGES.includes(",")) {
      const locales = env.CANON_LANGUAGES.split(",").filter(l => l !== localeDefault);
      const secondaryLocale = locales[0];
      locales.forEach(locale => {
        formatters[locale] = funcifyFormatterByLocale(this.props.formatters, locale);
      });
      this.setState({locales, formatters, secondaryLocale, localeDefault, pathObj});
    }
    else {
      this.setState({localeDefault, formatters, pathObj});
    }

  }

  getChildContext() {
    const {formatters} = this.state;
    return {formatters};
  }

  handleTabChange(newTab) {
    const {currentTab} = this.state;
    if (newTab !== currentTab) {
      this.setState({currentTab: newTab});
    }
  }

  handleLocaleSelect(e) {
    const val = e.target.value;
    this.setState({
      secondaryLocale: val === "none" ? null : val
      // showLocale: val === "none" ? false : true
    });
  }

  toggleSettings() {
    this.setState({settingsOpen: !this.state.settingsOpen});
  }

  setPath(pathObj) {
    const diffProfile = String(pathObj.profile) !== String(this.state.pathObj.profile);
    const diffSection = String(pathObj.section) !== String(this.state.pathObj.section);
    if (diffProfile || diffSection) {
      const {router} = this.props;
      let url = `?profile=${pathObj.profile}`;
      if (pathObj.section) url += `&section=${pathObj.section}`;
      // if (pathObj.previews) url += `&previews=${pathObj.previews}`;
      router.replace(url);
      this.setState({pathObj});
    }
  }

  render() {
    const {currentTab, secondaryLocale, locales, localeDefault, pathObj, settingsOpen} = this.state;
    const {isEnabled} = this.props;
    const navLinks = ["profiles", "stories"];

    if (!isEnabled) return null;

    return (
      <div className="cms">
        <div className="cms-nav">
          {navLinks.map(navLink =>
            <button
              key={navLink}
              className={`cms-nav-link${navLink === currentTab ? " is-active" : ""}`}
              onClick={this.handleTabChange.bind(this, navLink)}>
              {navLink}
            </button>
          )}

          <div className="cms-nav-settings-button-container">
            <Button className="cms-nav-settings-button" context="cms" icon="cog" onClick={this.toggleSettings.bind(this)}>
              settings
            </Button>
          </div>

          <div className={`cms-nav-settings ${settingsOpen ? "is-visible" : "is-hidden"}`}>
            {/* locale select */}
            {locales &&
              <React.Fragment>
                <h2 className="cms-nav-settings-heading font-sm">
                  Languages
                </h2>
                {/* primary locale */}
                {/* NOTE: currently just shows the primary locale in a dropdown */}
                <Select
                  label="Primary"
                  fontSize="xs"
                  context="cms"
                  inline
                  options={[localeDefault]}
                />
                {/* secondary locale */}
                <Select
                  label="Secondary"
                  fontSize="xs"
                  context="cms"
                  inline
                  value={secondaryLocale}
                  options={locales.map(loc => loc)}
                  onChange={this.handleLocaleSelect.bind(this)}
                >
                  <option value="none">none</option>
                </Select>
              </React.Fragment>
            }
          </div>
        </div>

        {currentTab === "profiles" &&
          <ProfileBuilder
            pathObj={pathObj}
            setPath={this.setPath.bind(this)}
            localeDefault={localeDefault}
            locale={secondaryLocale}
          />
        }
        {currentTab === "stories" &&
          <StoryBuilder
            // pathObj={pathObj}
            // setPath={this.setPath.bind(this)}
            localeDefault={localeDefault}
            locale={secondaryLocale}
          />
        }
      </div>
    );
  }
}

Builder.childContextTypes = {
  formatters: PropTypes.object
};

Builder.need = [
  fetchData("formatters", "/api/formatters"),
  fetchData("isEnabled", "/api/cms")
];

export default connect(state => ({
  formatters: state.data.formatters,
  env: state.env,
  isEnabled: state.data.isEnabled
}))(Builder);
