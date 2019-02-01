import libs from "./utils/libs";
import React, {Component} from "react";
import PropTypes from "prop-types";
import ProfileBuilder from "./profile/ProfileBuilder";
import StoryBuilder from "./story/StoryBuilder";
import FormatterEditor from "./formatter/FormatterEditor";
import {fetchData} from "@datawheel/canon-core";
import {connect} from "react-redux";
// import formatters from "./utils/formatters";

import "./cms.css";
import "./themes/cms-dark.css";
import "./themes/cms-light.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "profiles",
      // formatters,
      theme: "cms-light",
      locales: false,
      locale: false,

      formatters: (props.formatters || []).reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {})
    };
  }

  componentDidMount() {
    const {isEnabled, env} = this.props;
    // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
    if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
    
    // env.CANON_LANGUAGES = false;
    // Retrieve the langs from canon vars, use it to build the second language select dropdown.
    if (env.CANON_LANGUAGES && env.CANON_LANGUAGES.includes(",")) {
      const locales = env.CANON_LANGUAGES.split(",").filter(l => l !== "en");
      const locale = locales[0];
      this.setState({locales, locale});
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

  handleThemeSelect(e) {
    this.setState({theme: e.target.value});
  }

  handleLocaleSelect(e) {
    this.setState({locale: e.target.value});
  }

  render() {
    const {currentTab, theme, locale, locales} = this.state;
    const {isEnabled} = this.props;
    const navLinks = ["profiles", "stories", "formatters"];

    if (!isEnabled) return null;

    return (
      <div className={`cms ${theme}`}>
        <div className="cms-nav">
          {navLinks.map(navLink =>
            <button
              key={navLink}
              className={`cms-nav-link${navLink === currentTab ? " is-active" : ""}`}
              onClick={this.handleTabChange.bind(this, navLink)}>
              {navLink}
            </button>
          )}
          {locales && locale && <label className="cms-select-label cms-theme-select">second language: 
            <select
              className="cms-select"
              name="select-theme"
              id="select-theme"
              value={locale}
              onChange={this.handleLocaleSelect.bind(this)}
            >
              {locales.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </label>}
          <label className="cms-select-label cms-theme-select">theme: 
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
          </label>
        </div>
        {currentTab === "profiles" && <ProfileBuilder locale={locale}/>}
        {currentTab === "stories" && <StoryBuilder locale={locale}/>}
        {currentTab === "formatters" && <FormatterEditor />}
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
