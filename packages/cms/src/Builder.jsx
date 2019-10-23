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
      locales: false,
      localeDefault: false,
      secondaryLocale: false,
      pathObj: {},
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
      const secondaryLocale = locales[0];
      locales.forEach(locale => {
        formatters[locale] = funcifyFormatterByLocale(this.props.formatters, locale);
      });
      this.setState({locales, formatters, secondaryLocale, localeDefault, pathObj, currentTab});
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
    this.setState({
      secondaryLocale: val === "none" ? null : val
      // showLocale: val === "none" ? false : true
    });
  }

  toggleSettings() {
    this.setState({settingsOpen: !this.state.settingsOpen});
  }

  toggleOutline() {
    this.setState({outlineOpen: !this.state.outlineOpen});
  }

  editEntitySettings(entity) {
    console.log(`This should open a dialog for editing ${entity} metadata`);
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
    const {currentTab, secondaryLocale, locales, localeDefault, pathObj, outlineOpen, settingsOpen, userInit} = this.state;
    const {isEnabled, env, auth, router} = this.props;
    let {pathname} = router.location;
    if (pathname.charAt(0) !== "/") pathname = `/${pathname}`;

    const waitingForUser = yn(env.CANON_LOGINS) && !userInit;

    if (!isEnabled || waitingForUser) return null;

    if (yn(env.CANON_LOGINS) && !auth.user) return <AuthForm redirect={pathname}/>;

    if (yn(env.CANON_LOGINS) && auth.user && auth.user.role < 1) {
      return (
        <AuthForm redirect={pathname} error={true} auth={auth} />
      );
    }

    // placeholder values
    let currEntity = "metadata";
    if (currentTab === "profiles") currEntity = "currEntity";
    if (currentTab === "stories")  currEntity = "currEntity";

    const profileLinks = [
      {title: "profile1", url: "1"},
      {title: "profile2", url: "2"},
      {title: "profile3", url: "3"}
    ];
    const storyLinks = [
      {title: "story1", url: "1"},
      {title: "story2", url: "2"},
      {title: "story3", url: "3"}
    ];

    // non-placeholder values
    const navLinks = [
      {title: "profiles", items: profileLinks},
      {title: "stories",  items: storyLinks},
      {title: "metadata"}
    ];

    // render settings when available
    let settings = {};
    if (locales) {
      settings.locales = {
        primaryLocale: localeDefault,
        secondaryLocale,
        availableLocales: locales
      };
    }
    if (auth.user) settings.account = true;

    // callback functions passed down as props
    const onTabChange           = tab     => this.handleTabChange(tab);
    const onLocaleSelect        = locale  => this.handleLocaleSelect(locale);
    const onOpenEntitySettings  = entity  => this.editEntitySettings(entity);
    const onOutlineToggle       = val     => this.toggleOutline(val);
    const onSettingsToggle      = val     => this.toggleSettings(val);

    const navbarProps = {
      currentTab,
      currEntity,
      navLinks,
      settings,
      settingsOpen,
      onTabChange,
      onLocaleSelect,
      onOpenEntitySettings,
      onOutlineToggle,
      onSettingsToggle,
      outlineOpen
    };

    // Define component to render as editor
    let Editor = MetaEditor;
    if (currentTab === "profiles") Editor = ProfileBuilder;
    if (currentTab === "stories")  Editor = StoryBuilder;

    const editorProps = {
      pathObj,
      localeDefault,
      locale: secondaryLocale
    };

    // This invisible AceWrapper is necessary, because running the require function in the render cycle of AceWrapper
    // can cause components to remount (notably the toolbox, hitting all generators). By putting this dummy AceWrapper in
    // the top-level Builder.jsx, we run the require function "once and for all", so future instantiations of AceWrapper
    // do not cause any components to jigger and unmount/remount.
    const HiddenAce = <div className="u-visually-hidden"><AceWrapper /></div>;

    return (
      <div className={`cms cms-${currentTab}-page`}>
        <Navbar {...navbarProps} key="navbar" />
        <Editor {...editorProps} key="editor" />
        {HiddenAce}
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
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  dispatch: action => dispatch(action),
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Builder);
