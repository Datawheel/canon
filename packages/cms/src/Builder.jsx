import funcifyFormatterByLocale from "./utils/funcifyFormatterByLocale";
import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import yn from "yn";
import {Icon} from "@blueprintjs/core";

import {fetchData} from "@datawheel/canon-core";
import {isAuthenticated} from "@datawheel/canon-core";
import ProfileBuilder from "./profile/ProfileBuilder";
import StoryBuilder from "./story/StoryBuilder";
import MetaEditor from "./member/MetaEditor";
import Select from "./components/fields/Select";
import Button from "./components/fields/Button";
import AuthForm from "./components/interface/AuthForm";

import {setStatus} from "./actions/status";

import AceWrapper from "./components/editors/AceWrapper";

import "./css/utilities.css";
import "./css/base.css";
import "./css/blueprint-overrides.css";
import "./css/form-fields.css";
import "./css/layout.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: null,
      pathObj: {},
      formatters: {},
      userInit: false
    };
  }

  componentDidMount() {
    const {isEnabled, env} = this.props;
    const {router} = this.props;
    const {location} = router;
    const {tab, profile, section, previews, story, storysection} = location.query;

    this.props.isAuthenticated();

    // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
    if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
    
    let currentTab;
    if (tab) {
      currentTab = tab;
    }
    else {
      currentTab = "profiles";
      const {pathname} = location;
      const url = `${pathname}?tab=profiles`;
      router.replace(url);
    }

    const pathObj = {profile, section, previews, story, storysection, tab: currentTab};

    // Retrieve the langs from canon vars, use it to build the second language select dropdown.
    const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
    const formatters = {};
    formatters[localeDefault] = funcifyFormatterByLocale(this.props.formatters, localeDefault);
    if (env.CANON_LANGUAGES && env.CANON_LANGUAGES.includes(",")) {
      const locales = env.CANON_LANGUAGES.split(",").filter(l => l !== localeDefault);
      const localeSecondary = locales[0];
      locales.forEach(locale => {
        formatters[locale] = funcifyFormatterByLocale(this.props.formatters, locale);
      });
      this.props.setStatus({locales, localeSecondary, localeDefault});
      this.setState({formatters, pathObj, currentTab});
    }
    else {
      this.setState({localeDefault, formatters, pathObj, currentTab});
    }

  }

  componentDidUpdate(prevProps) {
    if (prevProps.auth.loading && !this.props.auth.loading) {
      this.setState({userInit: true});
    }
  }

  getChildContext() {
    const {formatters} = this.state;
    const setPath = this.setPath.bind(this);
    return {
      formatters,
      setPath
    };
  }

  handleTabChange(newTab) {
    const {currentTab} = this.state;
    if (newTab !== currentTab) {
      const newPathObj = {tab: newTab};
      this.setState({currentTab: newTab, pathObj: newPathObj}, this.setPath.bind(this, newPathObj));
    }
  }

  handleLocaleSelect(e) {
    const val = e.target.value;
    this.props.setStatus({
      localeSecondary: val === "none" ? null : val
    });
  }

  toggleSettings() {
    this.setState({settingsOpen: !this.state.settingsOpen});
  }

  setPath(pathObj) {
    const {currentTab} = this.state;
    // The underlying Editors don't know about tabs, so they will send pathObjs that don't have a tab in them.
    // Always trust Builder.jsx's current tab, and assign it into whatever the Editors send up.
    pathObj = Object.assign({}, pathObj, {tab: currentTab});
    const {router} = this.props;
    const {pathname} = router.location;
    let url = `${pathname}?tab=${pathObj.tab}`;
    // Profile
    if (pathObj.profile) url += `&profile=${pathObj.profile}`;
    if (pathObj.section) url += `&section=${pathObj.section}`;
    if (pathObj.previews) {
      const previews = pathObj.previews.map(d => d.id).join();
      url += `&previews=${previews}`;
    }
    // Story 
    if (pathObj.story) url += `&story=${pathObj.story}`;
    if (pathObj.storysection) url += `&storysection=${pathObj.storysection}`;
    router.replace(url);
    this.setState({pathObj});
  }

  render() {
    const {currentTab, pathObj, settingsOpen, userInit} = this.state;
    const {locales, localeDefault, localeSecondary} = this.props.status;
    const {isEnabled, env, auth, router} = this.props;
    let {pathname} = router.location;
    if (pathname.charAt(0) !== "/") pathname = `/${pathname}`;
    const navLinks = ["profiles", "stories", "metadata"];

    const waitingForUser = yn(env.CANON_LOGINS) && !userInit;

    if (!isEnabled || waitingForUser) return null;

    if (yn(env.CANON_LOGINS) && !auth.user) return <AuthForm redirect={pathname}/>;

    if (yn(env.CANON_LOGINS) && auth.user && auth.user.role < 1) {
      return (
        <AuthForm redirect={pathname} error={true} auth={auth} />
      );
    }

    return (
      <div className={`cms cms-${currentTab}-page`}>
        <div className={`cms-nav${settingsOpen ? " settings-visible" : ""}`}>
          <div className="cms-nav-main">
            {navLinks.map(navLink =>
              <button
                key={navLink}
                className={`cms-nav-link u-font-xs${navLink === currentTab ? " is-active" : ""}`}
                onClick={this.handleTabChange.bind(this, navLink)}>
                {navLink}
              </button>
            )}
          </div>
          {(locales || auth.user) && <React.Fragment>
            <div className="cms-nav-settings-button-container">
              <Button
                className="cms-nav-settings-button"
                namespace="cms"
                icon="cog"
                fontSize="xs"
                active={settingsOpen}
                onClick={this.toggleSettings.bind(this)}
              >
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
                    value={localeSecondary}
                    options={locales.map(loc => loc)}
                    onChange={this.handleLocaleSelect.bind(this)}
                    tabIndex={settingsOpen ? null : "-1"}
                  >
                    <option value="none">none</option>
                  </Select>
                </React.Fragment>
              }
              {auth.user &&
                <React.Fragment>
                  <h2 className="cms-nav-settings-heading u-font-sm u-margin-top-md">
                    Account
                  </h2>
                  <a className="cms-button cms-fill-button u-margin-bottom-xs" href="/auth/logout">
                    <Icon className="cms-button-icon" icon="log-out" />
                    <span className="cms-button-text">Log Out</span>
                  </a>
                </React.Fragment>
              }
            </div>
            <button
              className={`cms-nav-settings-overlay ${settingsOpen ? "is-visible" : "is-hidden"}`}
              onClick={this.toggleSettings.bind(this)}
              tabIndex={settingsOpen ? null : "-1"}
            />
          </React.Fragment> }
        </div>

        {currentTab === "profiles" &&
          <ProfileBuilder
            pathObj={pathObj}
          />
        }
        {currentTab === "stories" &&
          <StoryBuilder
            pathObj={pathObj}
          />
        }
        {currentTab === "metadata" &&
          <MetaEditor
            pathObj={pathObj}
          />
        }
        {/* 
          This invisible AceWrapper is necessary, because running the require function in the render cycle of AceWrapper
          can cause components to remount (notably the toolbox, hitting all generators). By putting this dummy AceWrapper in 
          the top-level Builder.jsx, we run the require function "once and for all", so future instantiations of AceWrapper
          do not cause any components to jigger and unmount/remount.
        */}
        <div style={{display: "none"}}><AceWrapper /></div>
      </div>
    );
  }
}

Builder.childContextTypes = {
  formatters: PropTypes.object,
  setPath: PropTypes.func
};

Builder.need = [
  fetchData("formatters", "/api/formatters"),
  fetchData("isEnabled", "/api/cms")
];

const mapStateToProps = state => ({
  formatters: state.data.formatters,
  env: state.env,
  isEnabled: state.data.isEnabled,
  status: state.cms.status,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  dispatch: action => dispatch(action),
  setStatus: status => dispatch(setStatus(status)),
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Builder);
