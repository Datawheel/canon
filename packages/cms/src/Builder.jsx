import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import yn from "yn";

import {fetchData} from "@datawheel/canon-core";
import {isAuthenticated} from "@datawheel/canon-core";

import funcifyFormatterByLocale from "./utils/funcifyFormatterByLocale";

import ProfileBuilder from "./profile/ProfileBuilder";
import StoryBuilder from "./story/StoryBuilder";
import MetaEditor from "./member/MetaEditor";
import AuthForm from "./components/interface/AuthForm";
import Navbar from "./components/interface/Navbar";

import {setStatus} from "./actions/status";

import AceWrapper from "./components/editors/AceWrapper";

import "./css/utilities.css";
import "./css/base.css";
import "./css/blueprint-overrides.css";
import "./css/form-fields.css";
import "./css/layout.css";
import "./css/keyframes.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      formatters: {},
      userInit: false,
      outlineOpen: true
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
      // Default to no secondary language
      const localeSecondary = null;
      locales.forEach(locale => {
        formatters[locale] = funcifyFormatterByLocale(this.props.formatters, locale);
      });
      this.props.setStatus({locales, localeSecondary, localeDefault, pathObj});
      this.setState({formatters});
    }
    else {
      this.props.setStatus({localeDefault, pathObj});
      this.setState({formatters});
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.auth.loading && !this.props.auth.loading) {
      this.setState({userInit: true});
    }
    // if location queries change, create new pathobj & set that
    if (JSON.stringify(prevProps.status.pathObj) !== JSON.stringify(this.props.status.pathObj)) {
      this.setPath.bind(this)();
    }
  }

  getChildContext() {
    const {formatters} = this.state;
    return {
      formatters
    };
  }

  setPath() {
    const {pathObj} = this.props.status;
    const {router} = this.props;
    const {pathname} = router.location;
    let url = `${pathname}?tab=${pathObj.tab}`;
    // Profile
    if (pathObj.profile) url += `&profile=${pathObj.profile}`;
    if (pathObj.section) url += `&section=${pathObj.section}`;
    // previews may come in as a string (from the URL) or an array (from the app).
    // Set the url correctly either way.
    if (pathObj.previews) {
      const previews = typeof pathObj.previews === "string" ? pathObj.previews : pathObj.previews.map(d => d.id).join();
      url += `&previews=${previews}`;
    }
    // Story
    if (pathObj.story) url += `&story=${pathObj.story}`;
    if (pathObj.storysection) url += `&storysection=${pathObj.storysection}`;
    router.replace(url);
  }

  render() {
    const {userInit} = this.state;
    const {isEnabled, env, auth, router} = this.props;
    const {pathObj} = this.props.status;
    const currentTab = pathObj.tab;
    let {pathname} = router.location;
    if (pathname.charAt(0) !== "/") pathname = `/${pathname}`;

    const waitingForUser = yn(env.CANON_LOGINS) && !userInit;

    if (!isEnabled || waitingForUser || !currentTab) return null;

    if (yn(env.CANON_LOGINS) && !auth.user) return <AuthForm redirect={pathname}/>;

    if (yn(env.CANON_LOGINS) && auth.user && auth.user.role < 1) {
      return (
        <AuthForm redirect={pathname} error={true} auth={auth} />
      );
    }

    // Define component to render as editor
    let Builder;
    if (currentTab === "metadata") Builder = MetaEditor;
    if (currentTab === "profiles") Builder = ProfileBuilder;
    if (currentTab === "stories")  Builder = StoryBuilder;

    if (!Builder) return null;

    // This invisible AceWrapper is necessary, because running the require function in the render cycle of AceWrapper
    // can cause components to remount (notably the toolbox, hitting all generators). By putting this dummy AceWrapper in
    // the top-level Builder.jsx, we run the require function "once and for all", so future instantiations of AceWrapper
    // do not cause any components to jigger and unmount/remount.
    const HiddenAce = <div className="u-visually-hidden"><AceWrapper /></div>;

    return (
      <div className={`cms cms-${currentTab}-page`}>
        <Navbar key="navbar" />
        <Builder key="editor" />
        {HiddenAce}
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
  env: state.env,
  auth: state.auth,
  status: state.cms.status,
  formatters: state.data.formatters,
  isEnabled: state.data.isEnabled
});

const mapDispatchToProps = dispatch => ({
  dispatch: action => dispatch(action),
  setStatus: status => dispatch(setStatus(status)),
  isAuthenticated: () => dispatch(isAuthenticated())
});

export default connect(mapStateToProps, mapDispatchToProps)(Builder);
