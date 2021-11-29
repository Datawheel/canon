/* React */
import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import {Helmet} from "react-helmet-async";

/* Utils */
import deepClone from "../utils/deepClone.js";
import funcifyFormatterByLocale from "../utils/funcifyFormatterByLocale";
import mortarEval from "../utils/mortarEval";
import prepareStory from "../utils/prepareStory";
import stripHTML from "../utils/formatters/stripHTML";

/* Sections */
import Section from "./sections/Section";
import Hero from "./sections/Hero";
import Mirror from "./Viz/Mirror";

/* CSS */
import "./Story.css";

class Story extends Component {

  constructor(props) {
    super(props);
    this.state = {
      story: props.story,
      // Take a one-time, initial snapshot of the entire variable set at load time to be passed via context.
      // This is necessary because embedded sections need a pure untouched variable set, so they can reset
      // the variables they changed via setVariables back to the original state at load time.
      initialVariables: deepClone(props.story.variables),
      selectors: {},
      loading: false,
      setVarsLoading: false,
      formatterFunctions: funcifyFormatterByLocale(props.formatters, props.locale)
    };
  }

  getChildContext() {
    const {router} = this.props;
    const {locale} = this.props;
    const {story, initialVariables, formatterFunctions} = this.state;
    const {variables} = story;

    return {
      formatters: formatterFunctions,
      router,
      onSelector: this.onSelector.bind(this),
      onTabSelect: this.onTabSelect.bind(this),
      variables,
      initialVariables,
      locale
    };
  }

  /**
   * Visualizations have the ability to "break out" and override a variable in the variables object.
   * This requires re-running materializers, because the user may have changed a variable
   * that would affect the "allowed" status of a given section.
   */
  onSetVariables(newVariables, forceMats) {
    const {story, selectors, setVarsLoading, formatterFunctions} = this.state;
    const {variables} = story;
    const {locale} = this.props;
    // Users should ONLY call setVariables in a callback - never in the main execution, as this
    // would cause an infinite loop. However, should they do so anyway, try and prevent the infinite
    // loop by checking if the vars are in there already, only updating if they are not yet set.
    const alreadySet = Object.keys(newVariables).every(key => variables[key] === newVariables[key]);
    if (!setVarsLoading && !alreadySet) {
      // If forceMats is true, this function has been called by the componentDidMount, and we must run materializers
      // so that variables like `isLoggedIn` can resolve to true.
      if (forceMats) {
        const combinedVariables = {...variables, ...newVariables};
        const matVars = variables._rawStory.allMaterializers.reduce((acc, m) => {
          const evalResults = mortarEval("variables", acc, m.logic, formatterFunctions, locale);
          if (typeof evalResults.vars !== "object") evalResults.vars = {};
          return {...acc, ...evalResults.vars};
        }, combinedVariables);
        const newStory = prepareStory(variables._rawStory, matVars, formatterFunctions, locale, selectors);
        this.setState({story: {...story, ...newStory}});
      }
      // If forceMats is not true, no materializers are required. Using the locally stored _rawStory and the now-combined
      // old and new variables, you have all that you need to make the story update.
      else {
        const newStory = prepareStory(variables._rawStory, Object.assign({}, variables, newVariables), formatterFunctions, locale, selectors);
        this.setState({story: {...story, ...newStory}});
      }
    }
  }

  onTabSelect(id, index) {
    this.updateQuery({[`tabsection-${id}`]: index});
  }

  updateQuery(obj) {
    const {router} = this.props;
    const {location} = router;
    const {basename, pathname, query} = location;
    const newQuery = {...query, ...obj};
    const queryString = Object.entries(newQuery).map(([key, val]) => `${key}=${val}`).join("&");
    const newPath = `${basename}${pathname}?${queryString}`;
    if (queryString) router.replace(newPath);
  }

  onSelector(name, value) {
    const {story, selectors, formatterFunctions} = this.state;
    const {variables} = story;
    const {locale} = this.props;

    selectors[name] = value;

    this.updateQuery(selectors);

    const newStory = prepareStory(variables._rawStory, variables, formatterFunctions, locale, selectors);
    this.setState({selectors, story: {...story, ...newStory}});
  }


  render() {
    const {story, loading} = this.state;

    if (!story) return null;
    if (story.error) return <div>{story.error}</div>;

    const {storysections} = story;
    const titleRaw = stripHTML(this.props.story.title);

    return (
      <Fragment>
        <div className="cp-story">
          <Helmet title={titleRaw} />
          <Hero profile={story} type="story"/>
          <main className="cp-story-main" id="main">
            {storysections.map((section, i) =>
              <Section
                key={`${section.slug}-${i}`}
                contents={section}
                onSetVariables={this.onSetVariables.bind(this)}
                loading={loading}
              />
            )}
          </main>
        </div>

        <Mirror /> {/* for rendering visualization/section to save as image */}
      </Fragment>
    );
  }
}

Story.childContextTypes = {
  formatters: PropTypes.object,
  locale: PropTypes.string,
  router: PropTypes.object,
  variables: PropTypes.object,
  initialVariables: PropTypes.object,
  onSelector: PropTypes.func,
  onTabSelect: PropTypes.func
};

Story.need = [
  fetchData("story", "/api/story/<slug>/"),
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({
  formatters: state.data.formatters,
  story: state.data.story,
  locale: state.i18n.locale
}))(Story);
