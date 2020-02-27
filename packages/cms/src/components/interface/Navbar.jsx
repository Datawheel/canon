import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {hot} from "react-hot-loader/root";
import {Icon} from "@blueprintjs/core";

import varSwapRecursive from "../../utils/varSwapRecursive";

import {getProfiles, newProfile, deleteProfile, setVariables, resetPreviews} from "../../actions/profiles";
import {getStories, newStory, deleteStory} from "../../actions/stories";
import {setStatus} from "../../actions/status";

import stripHTML from "../../utils/formatters/stripHTML";
import groupMeta from "../../utils/groupMeta";

import Dropdown from "./Dropdown";
import Outline from "./Outline";
import Select from "../fields/Select";
import Button from "../fields/Button";

import "./Navbar.css";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navOpen: false,
      outlineOpen: true,
      settingsOpen: false,
      currEntity: null
    };
  }

  componentDidMount() {
    this.props.getProfiles();
    this.props.getStories();
  }

  componentDidUpdate(prevProps) {
    const {pathObj} = this.props.status;

    // If the user renamed an entity or the variables changed, force an update to redraw the titles
    const changedVariablesOrTitle = prevProps.status.diffCounter !== this.props.status.diffCounter;
    const changedQuery = JSON.stringify(prevProps.status.query) !== JSON.stringify(this.props.status.query);
    if (changedVariablesOrTitle || changedQuery) {
      this.forceUpdate();
    }

    const profilesLoaded = !prevProps.status.profilesLoaded && this.props.status.profilesLoaded;
    const storiesLoaded = !prevProps.status.storiesLoaded && this.props.status.storiesLoaded;

    // If profiles load for the first time and pathObj is already set, this is a permalink. Open the node.
    if (profilesLoaded && pathObj.profile) {
      this.handleClick.bind(this)(pathObj);
    }

    // If stories load for the first time and pathObj is already set, this is a permalink. Open the node.
    if (storiesLoaded && pathObj.story) {
      this.handleClick.bind(this)(pathObj);
    }

    // Handle Entity Creation
    const {justCreated} = this.props.status;
    if (JSON.stringify(prevProps.status.justCreated) !== JSON.stringify(justCreated)) {
      if (justCreated.type === "profile") {
        this.handleClick.bind(this)({profile: justCreated.id, tab: "profiles"});
      }
      else if (justCreated.type === "section") {
        this.handleClick.bind(this)({profile: justCreated.profile_id, section: justCreated.id, tab: "profiles"});
      }
      else if (justCreated.type === "story") {
        this.handleClick.bind(this)({story: justCreated.id, tab: "stories"});
      }
      else if (justCreated.type === "storysection") {
        this.handleClick.bind(this)({story: justCreated.story_id, storysection: justCreated.id, tab: "stories"});
      }
    }

    // Handle Entity Deletion
    const {justDeleted} = this.props.status;
    if (JSON.stringify(prevProps.status.justDeleted) !== JSON.stringify(justDeleted)) {
      if (justDeleted.type === "profile") {
        const firstProfile = this.props.profiles[0];
        if (firstProfile) this.handleClick({profile: firstProfile.id, tab: "profiles"});
      }
      if (justDeleted.type === "section") {
        const thisProfile = this.props.profiles.find(p => p.id === justDeleted.parent_id);
        if (thisProfile) {
          const thisSection = thisProfile.sections[0];
          if (thisSection) this.handleClick({profile: thisProfile.id, section: thisSection.id, tab: "profiles"});
        }
      }
      if (justDeleted.type === "story") {
        const firstStory = this.props.stories[0];
        if (firstStory) this.handleClick({story: firstStory.id, tab: "stories"});
      }
      if (justDeleted.type === "storysection") {
        const thisStory = this.props.stories.find(p => p.id === justDeleted.parent_id);
        if (thisStory) {
          const thisStorysection = thisStory.storysections[0];
          if (thisStorysection) this.handleClick({story: thisStory.id, storysection: thisStorysection.id, tab: "stories"});
        }
      }
    }
  }

  handleLocaleSelect(e) {
    const val = e.target.value;
    this.props.setStatus({
      localeSecondary: val === "none" ? null : val
    });
  }

  // manage settings menu visibility
  closeSettings() {
    this.setState({settingsOpen: false});
  }
  toggleSettings() {
    this.setState({settingsOpen: !this.state.settingsOpen});
  }

  // manage nav visibility (used on small screens only)
  toggleNav() {
    this.setState({navOpen: !this.state.navOpen});
  }

  // manage outline visibility
  toggleOutline() {
    this.setState({outlineOpen: !this.state.outlineOpen});
  }

  // find an entity by id in a given tree
  getEntityId(id, tree) {
    const match = tree.find(t => t.id === id);
    return match;
  }

  // create a title by joining dimensions together
  makeTitleFromDimensions(entity) {
    if (entity.meta && entity.meta.length) {
      const groupedMeta = groupMeta(entity.meta);
      return groupedMeta.length > 0 ? groupedMeta.map(g => g[0] ? g[0].slug : "ERR_META").join(" / ") : "Unnamed";      
    }
    else return "Unnamed";
  }

  // get the title of the current node, in the correct language
  getNodeTitle(node) {
    const {localeDefault} = this.props.status;
    const localeContent = node.content.find(c => c.locale === localeDefault);

    let title = node.slug || "no title";
    if (localeContent) title = this.formatLabel.bind(this)(localeContent.title);

    return title;
  }

  handleClick(pathObj) {
    const newPathObj = {...pathObj};
    if (pathObj.tab === "profiles") {
      const {currentPid, previews} = this.props.status;
      // If the pids match, don't reset any previews or variables
      if (currentPid === Number(pathObj.profile)) {
        newPathObj.previews = previews;
        this.props.setStatus({pathObj: newPathObj});
      }
      // If they don't match, update the currentPid and reset the preview
      else {
        this.props.setStatus({currentPid: Number(pathObj.profile), pathObj: newPathObj});
        this.props.resetPreviews();
        // TODO: Remove reset previews - have all profiles come from the server
        // with their default values already set.
      }
      if (pathObj.section) {
        this.setState({outlineOpen: true});
      }
    }
    else if (pathObj.tab === "stories") {
      this.props.setStatus({currentStoryPid: Number(pathObj.story), pathObj: newPathObj});
    }
    else if (pathObj.tab === "metadata") {
      this.props.setStatus({pathObj: newPathObj});
    }
  }

  formatLabel(str) {
    const {profiles} = this.props;
    const {query, localeDefault, currentPid} = this.props.status;
    const {formatterFunctions} = this.props.resources;
    const variables = this.props.status.variables[localeDefault] || {};
    const formatters = formatterFunctions[localeDefault];
    const thisProfile = profiles.find(p => p.id === currentPid);
    const selectors = thisProfile ? thisProfile.selectors : [];
    str = stripHTML(str);
    str = varSwapRecursive({str, selectors}, formatters, variables, query).str;
    return str;
  }

  /** format the data so it can be displayed/used */
  formatDisplay() {
    const {profiles, stories} = this.props;
    const {currentPid, currentStoryPid, pathObj} = this.props.status;
    const currentTab = pathObj.tab;

    let currEntity, currTree;
    if (currentTab === "metadata") currEntity = "metadata"; // done

    // get entity title and sections
    if (currentTab === "profiles") {
      currEntity = "profile";
      const currProfile = currentPid ? this.getEntityId(currentPid, profiles) : null;
      if (currProfile) {
        // profile title
        currEntity = this.makeTitleFromDimensions(currProfile);
        // sections
        currTree = currProfile.sections;
      }
    }

    // get entity title and sections for stories
    if (currentTab === "stories") {
      currEntity = "story";
      const currStory = currentStoryPid ? this.getEntityId(currentStoryPid, stories) : null;
      if (currStory) {
        // profile title
        currEntity = this.getNodeTitle(currStory);
        // sections
        currTree = currStory.storysections;
      }
    }

    // generate list of items to render in nav dropdowns
    const profileNavItems = [], storyNavItems = [];
    if (profiles.length) {
      profiles.map((profile, i) => {
        profileNavItems[i] = {
          title: this.makeTitleFromDimensions(profile),
          onClick: this.handleClick.bind(this, {profile: profile.id, tab: "profiles"}),
          selected: currentTab === "profiles" && currentPid === profile.id
        };
      });
      profileNavItems.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (!profileNavItems.find(p => p.title === "Create new profile")) {
      profileNavItems.push({
        title: "Create new profile",
        icon: "plus",
        onClick: () => this.createProfile()
      });
    }

    if (stories.length) {
      stories.map((story, i) => {
        storyNavItems[i] = {
          // get the profile title, or generate it from dimensions
          title: this.getNodeTitle(story),
          onClick: this.handleClick.bind(this, {story: story.id, tab: "stories"}),
          selected: currentTab === "stories" && currentStoryPid === story.id
        };
      });
    }
    if (!storyNavItems.find(p => p.title === "Create new story")) {
      storyNavItems.push({
        title: "Create new story",
        icon: "plus",
        onClick: () => this.createStory()
      });
    }

    // generate dropdowns for switching entities
    const navLinks = [
      {
        title: "Profiles",
        items: profileNavItems,
        selected: currentTab === "profiles" ? true : false,
        dropdown: true
      },
      {
        title: "Stories",
        items: storyNavItems, // TODO
        selected: currentTab === "stories" ? true : false,
        dropdown: true
      },
      {title: "Metadata"}
    ];

    return {currEntity, currTree, navLinks};
  }

  toggleEntitySettings() {
    const {currentPid, currentStoryPid, pathObj} = this.props.status;
    const {tab} = pathObj;
    if (tab === "profiles") {
      this.handleClick.bind(this)({profile: currentPid, tab: "profiles"});
    }
    if (tab === "stories") {
      this.handleClick.bind(this)({story: currentStoryPid, tab: "stories"});
    }
  }

  createProfile() {
    this.props.newProfile();
  }

  createStory() {
    this.props.newStory();
  }

  render() {
    const {auth} = this.props;
    const {locales, localeDefault, localeSecondary, pathObj} = this.props.status;
    const currentTab = pathObj.tab;
    const {outlineOpen, navOpen, settingsOpen} = this.state;
    const {currEntity, currTree, navLinks} = this.formatDisplay();

    const showLocales = locales;
    const showAccount = auth.user;
    const settingsAvailable = showLocales || showAccount;

    const hasClicked = pathObj.profile || pathObj.story;

    return (
      <nav className={`cms-navbar${settingsOpen ? " settings-visible" : ""}`}>
        {/* main (top) top navbar */}
        <div className="cms-navbar-inner">
          {/* title */}
          <div className={`cms-navbar-title ${hasClicked ? "with-node" : "without-node" }${!outlineOpen ? " outline-open" : ""}`}>
            {currEntity === "metadata" || !hasClicked
              // metadata; render as h1 with no controls
              ? <h1 className="cms-navbar-title-heading u-font-lg">
                {currEntity === "metadata" ? "Metadata editor" : `Choose a ${currEntity}`}
              </h1>
              // profile/story; render as button to collapse outline
              : <Fragment>
                <button
                  className="cms-navbar-title-button heading u-font-lg"
                  onClick={() => this.toggleOutline()}
                  aria-pressed={outlineOpen}
                >
                  <Icon className="cms-navbar-title-button-icon" icon="caret-down" />
                  <span className="cms-navbar-title-button-text">
                    {currEntity}{currentTab === "profiles" ? " profile" : ""}
                  </span>
                </button>
                <button className="cms-navbar-entity-settings-button" onClick={() => this.toggleEntitySettings(currEntity)}>
                  <span className="u-visually-hidden">edit {currEntity} metadata</span>
                  <Icon className="cms-navbar-entity-settings-button-icon" icon="cog" />
                </button>
              </Fragment>
            }
          </div>

          {/* button for toggling visibility of the list of links on small screens */}
          <Button
            className="cms-navbar-list-toggle-button u-hide-above-sm"
            onClick={() => this.toggleNav()}
            namespace="cms"
            icon={navOpen ? "cross" : "menu"}
            fontSize="xs"
          >
            menu
          </Button>
          {/* list of links */}
          <ul className={`cms-navbar-list ${navOpen ? "is-open" : "is-closed"}`}>
            {navLinks.map((navLink, i) =>
              navLink.dropdown && Array.isArray(navLink.items) && navLink.items.length
                // render a dropdown
                ? <Dropdown
                  title={navLink.title}
                  items={navLink.items}
                  selected={navLink.selected}
                />
                // render a single link
                : <li className="cms-navbar-item" key={navLink.title}>
                  <button
                    className={`cms-navbar-link${navLink.title.toLowerCase() === currentTab ? " is-selected" : ""}`}
                    onClick={() => this.handleClick.bind(this)({tab: navLink.title.toLowerCase()})}
                    onFocus={() => settingsAvailable && settingsOpen && i === navLinks.length - 1 ? this.closeSettings() : null}
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
                  onClick={() => this.toggleSettings()}
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
                    onChange={e => this.handleLocaleSelect(e)}
                    tabIndex={settingsOpen ? null : "-1"}
                  >
                    <option value="none">none</option>
                    {locales.map(locale =>
                      <option value={locale} key={locale}>{locale}</option>
                    )}
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
                className={`cms-navbar-settings-overlay cms-overlay ${settingsOpen ? "is-visible" : "is-hidden"}`}
                onClick={() => this.toggleSettings()}
                onFocus={() => this.closeSettings()}
                aria-labelledby="cms-navbar-settings-button"
                tabIndex={settingsOpen ? null : "-1"}
              />
            </div> : ""
          }
        </div>

        <Outline
          tree={currTree}
          isOpen={outlineOpen}
          getNodeTitle={node => this.getNodeTitle(node)}
          handleClick={pathObj => this.handleClick(pathObj)}
        />
      </nav>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  status: state.cms.status,
  resources: state.cms.resources,
  profiles: state.cms.profiles,
  stories: state.cms.stories
});

const mapDispatchToProps = dispatch => ({
  // Profiles
  getProfiles: () => dispatch(getProfiles()),
  newProfile: () => dispatch(newProfile()),
  deleteProfile: id => dispatch(deleteProfile(id)),
  resetPreviews: () => dispatch(resetPreviews()),
  // Stories
  getStories: () => dispatch(getStories()),
  newStory: () => dispatch(newStory()),
  deleteStory: id => dispatch(deleteStory(id)),
  // Status Operations
  setStatus: status => dispatch(setStatus(status)),
  setVariables: newVariables => dispatch(setVariables(newVariables))
});

export default connect(mapStateToProps, mapDispatchToProps)(hot(Navbar));
