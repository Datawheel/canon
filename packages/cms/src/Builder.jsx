import funcifyFormatterByLocale from "./utils/funcifyFormatterByLocale";
import React, {Component} from "react";
import PropTypes from "prop-types";
import Select from "./components/fields/Select";
import ProfileBuilder from "./profile/ProfileBuilder";
import {isAuthenticated} from "@datawheel/canon-core";
import StoryBuilder from "./story/StoryBuilder";
import {fetchData} from "@datawheel/canon-core";
import AuthForm from "./components/interface/AuthForm";
import {connect} from "react-redux";
import yn from "yn";

import Button from "./components/fields/Button";

import "./css/utilities.css";
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
      formatters: {},
      userInit: false
    };
  }

  componentDidMount() {
    const {isEnabled, env} = this.props;
    const {location} = this.props.router;
    const {profile, section, previews} = location.query;

    this.props.isAuthenticated();

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

  componentDidUpdate(prevProps) {
    if (prevProps.auth.loading && !this.props.auth.loading) {
      this.setState({userInit: true});
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
      const {pathname} = router.location;
      let url = pathname === "/" ? "" : "/";
      url += `${pathname}?profile=${pathObj.profile}`;
      if (pathObj.section) url += `&section=${pathObj.section}`;
      // if (pathObj.previews) url += `&previews=${pathObj.previews}`;
      router.replace(url);
      this.setState({pathObj});
    }
  }

  render() {
    const {currentTab, secondaryLocale, locales, localeDefault, pathObj, settingsOpen, userInit} = this.state;
    const {isEnabled, env, auth} = this.props;
    const navLinks = ["profiles", "stories"];

    const waitingForUser = yn(env.CANON_LOGINS) && !userInit;

    if (!isEnabled || waitingForUser) return null;

    if (yn(env.CANON_LOGINS) && !auth.user) return <AuthForm />;

    if (yn(env.CANON_LOGINS) && auth.user && auth.user.role < 1) {
      return (
        <div className="cms">
          <div className="cms-auth-form">
            <div className="cms-auth-form-inner">
              <h1 className="cms-auth-form-title">Error: insufficient permissions</h1>
              <p className="cms-auth-form-paragraph">
                User <strong>{auth.user.username}</strong> is currently not allowed to access the CMS. Please contact administrator.
                <br /><a className="cms-auth-form-link" href="/auth/logout">Log Out</a>
              </p>
            </div>
          </div>
        </div>
      );
    }

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
                <h2 className="cms-nav-settings-heading u-font-sm">
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
            {auth.user && <a href="/auth/logout">Log Out</a>}
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

const mapStateToProps = state => ({
  formatters: state.data.formatters,
  env: state.env,
  isEnabled: state.data.isEnabled,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  dispatch: action => dispatch(action),
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Builder);
