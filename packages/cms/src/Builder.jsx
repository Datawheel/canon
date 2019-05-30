import funcifyFormatterByLocale from "./utils/funcifyFormatterByLocale";
import React, {Component} from "react";
import PropTypes from "prop-types";
import ProfileBuilder from "./profile/ProfileBuilder";
import StoryBuilder from "./story/StoryBuilder";
import FormatterEditor from "./formatter/FormatterEditor";
import {fetchData} from "@datawheel/canon-core";
import {connect} from "react-redux";

import "./css/base.css";
import "./css/blueprint-overrides.css";
import "./css/form-fields.css";
import "./css/layout.css";
import "./css/shame.css";

// TODO: convert to components
import "./components/Button.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "profiles",
      locales: false,
      localeDefault: false,
      secondaryLocale: false,
      // showLocale: false,
      formatters: {}
    };
  }

  componentDidMount() {
    const {isEnabled, env} = this.props;
    // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
    if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";

    // env.CANON_LANGUAGES = false;
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
      this.setState({locales, formatters, secondaryLocale, localeDefault});
    }
    else {
      this.setState({localeDefault, formatters});
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

  /*
  setPath(node) {
    const {router} = this.props;
    const {pslug, tslug} = this.props.params;
    let path;
    if (node.itemType === "profile") {
      path = `/cms-profile/${node.data.slug}`;
    }
    else if (node.itemType === "topic") {
      path = `/cms-profile/${node.masterSlug}/${node.data.slug}`;
    }
    router.push(path);
  }
  */

  // toggleLocale(e) {
  //   const {locales} = this.state;
  //   const secondaryLocale = e.target.checked ? false : locales[0];
  //   const showLocale = e.target.checked;
  //   this.setState({showLocale, secondaryLocale});
  // }

  // handleThemeSelect(e) {
  //   this.setState({theme: e.target.value});
  // }

  handleLocaleSelect(e) {
    const val = e.target.value;
    this.setState({
      secondaryLocale: val === "none" ? null : val
      // showLocale: val === "none" ? false : true
    });
  }

  render() {
    const {currentTab, theme, secondaryLocale, locales, localeDefault} = this.state;
    const {isEnabled} = this.props;
    const navLinks = ["profiles", "stories", "formatters"];

    // console.log("showLocale", this.state.showLocale);

    /*
    const {profileSlug, topicSlug} = this.props.params;

    const pathObj = {profileSlug, topicSlug};
    */

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

          <div className="cms-nav-options">
            {/* locale select */}
            {locales &&
              <React.Fragment>
                {/* primary locale */}
                {/* NOTE: currently just shows the primary locale in a dropdown */}
                <label className="cms-select-label cms-locale-select">
                  <strong>languages</strong>: primary
                  <select className="cms-select">
                    <option key="current-locale" value={localeDefault}>{localeDefault}</option>
                  </select>
                </label>
                {/* secondary locale */}
                <label className="cms-select-label cms-locale-select">
                  secondary
                  <select
                    className="cms-select"
                    value={secondaryLocale}
                    onChange={this.handleLocaleSelect.bind(this)}
                  >
                    {locales.map(loc =>
                      <option key={loc} value={loc}>{loc}</option>)
                    }
                    <option key="no-locale" value="none">none</option>
                  </select>
                </label>
                {/* <span className="cms-nav-options-divider">|</span>*/}
              </React.Fragment>
            }
            {/* theme select */}
            {/* <label className="cms-select-label cms-theme-select">theme:
              <select
                className="cms-select"
                name="select-theme"
                id="select-theme"
                value={this.state.selectValue}
                onChange={this.handleThemeSelect.bind(this)}
              >
                <option value="cms-light">light</option>
                <option value="cms-dark">dark</option>
              </select>
            </label>*/}
          </div>
        </div>

        {currentTab === "profiles" &&
          <ProfileBuilder
            // pathObj={pathObj}
            // setPath={this.setPath.bind(this)}
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
        {currentTab === "formatters" &&
          <FormatterEditor />
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
