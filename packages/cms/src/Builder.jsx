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

      formatters: (props.formatters || []).reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {})
    };
  }

  componentDidMount() {
    const {NODE_ENV} = this.props.env;
    // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
    if (NODE_ENV !== "development" && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
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

  render() {
    const {currentTab, theme} = this.state;
    const navLinks = ["profiles", "stories", "formatters"];

    if (this.props.env.NODE_ENV !== "development") return null;

    return (
      <div className={`cms ${theme}`}>
        <div className="cms-nav">
          {navLinks.map(navLink =>
            <button
              className={`cms-nav-link${navLink === currentTab ? " is-active" : ""}`}
              onClick={this.handleTabChange.bind(this, navLink)}>
              {navLink}
            </button>
          )}
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
        {currentTab === "profiles" && <ProfileBuilder />}
        {currentTab === "stories" && <StoryBuilder />}
        {currentTab === "formatters" && <FormatterEditor />}
      </div>
    );
  }
}

Builder.childContextTypes = {
  formatters: PropTypes.object
};

Builder.need = [
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({
  formatters: state.data.formatters,
  env: state.env
}))(Builder);
