import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {hot} from "react-hot-loader/root";
import PropTypes from "prop-types";
import {Dialog} from "@blueprintjs/core";

import stripHTML from "../../utils/formatters/stripHTML";
import groupMeta from "../../utils/groupMeta";

import Viz from "../Viz/Viz";
import SourceGroup from "../Viz/SourceGroup";
import StatGroup from "../Viz/StatGroup";

import Button from "../fields/Button";

import Parse from "./components/Parse";
import ProfileSearch from "../fields/ProfileSearch";

import "./Section.css";
import "./Hero.css";

/** the profile hero, AKA header, AKA splash */
class Hero extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: props.contents,
      loading: false,
      selectors: {},
      sources: [],
      images: [],
      creditsVisible: false,
      clickedIndex: undefined
    };

    if (typeof window !== "undefined") window.titleClick = this.titleClick.bind(this);
  }

  componentDidMount() {
    const {profile} = this.props;
    const {dims} = profile;

    /** Image Metadata
      * A profile is a set of one more slug/id pairs. In multi-variate profiles, these pairs are strictly
      * ordered, for example, /geo/mass/export/coal/import/cars. Each of these slug/id pairs may or may not
      * have image data associated with it, which makes up the backdrop of the Hero Section. If it does have
      * an image, then it also will have metadata. The `images` array that I create is a strictly ordered
      * array of image links and their data. This means, in the example above, if /export/coal is the only
      * one of the three that have an image, then this image array will be [null, {imageData}, null].
      */

    const images = [];
    if (dims) {
      for (let i = 0; i < dims.length; i++) {
        if (profile.images[i]) {
          images.push({
            src: `/api/image?slug=${dims[i].slug}&id=${dims[i].id}&type=splash`,
            author: profile.images[i].author,
            meta: profile.images[i].meta,
            permalink: profile.images[i].url
          });
        }
      }
    }

    this.setState({images});
  }

  titleClick(index) {
    this.setState({clickedIndex: index});
    setTimeout(() => {
      document.querySelector(".cp-hero-search .cp-input").focus();
    }, 300);
  }

  /**
   * Users may click the title of a profile to search on that dimension. However, the embedded ProfileSearch component
   * makes use of the /api/profilesearch (deepsearch) endpoint. That endpoint's main function is to return full profiles,
   * not search on individual dimensions. However, it does return a "results" key with the raw deepsearch responses, keyed
   * by dimension. So, when a user is searching, take the relevants results from the raw "results" key, and intelligently
   * combine them with the "locked" other member (in the case of bilaterals) to build a full "linkify-able" search Result.
   */
  formatResults(resp) {
    const {clickedIndex} = this.state;
    const {meta, variables} = this.props.profile;
    const {router} = this.context;
    const groupedMeta = groupMeta(meta);
    let dimensionResults = [];
    if (groupedMeta[clickedIndex] && (groupedMeta.length === 1 || groupedMeta.length === 2)) {
      const rawResults = resp.data.results;
      // A single "slot" in the meta may have multiple variants - grab all possible variants
      const metaVariants = groupedMeta[clickedIndex];
      if (metaVariants) {
        try {
          // Filter down to the applicable dimensions - the ones that match any of the possible variants.
          const relevantDimensions = Object.keys(rawResults).filter(d => metaVariants.map(m => m.dimension).includes(d));
          // For each relevant dimension of the raw Results, collate linkifyable objects
          relevantDimensions.forEach(dim => {
            // First make a function that turns a deepsearch result into a linkify object
            const formatFoundResult = d => ({
              slug: metaVariants.find(m => m.cubeName === d.metadata.cube_name).slug,
              id: d.metadata.id,
              memberSlug: d.metadata.slug,
              memberDimension: dim,
              memberHierarchy: d.metadata.hierarchy,
              name: d.name,
              ranking: d.popularity
            });
            // Only use results that match the possible variants of the meta we are searching on
            const filteredResults = rawResults[dim].filter(d => metaVariants.map(m => m.cubeName).includes(d.metadata.cube_name));
            // Remember that the search results only pertain to one dimension
            const scaffoldedResults = filteredResults.map(d => {
              // If this is a unary profile, just wrap it in an array for linkify, no need for scaffolding
              if (groupedMeta.length === 1) {
                return [formatFoundResult(d)];
              }
              // However if bilateral, scaffold out the other "Fixed" member to fully formulate a link
              else {
                const otherIndex = clickedIndex === 0 ? 1 : 0;
                const thisResult = [];
                thisResult[clickedIndex] = formatFoundResult(d);
                const slugKey = clickedIndex === 0 ? "slug2" : "slug";
                const varIndex = otherIndex + 1;
                // use the variables object to scaffold out the "fixed" member
                thisResult[otherIndex] = {
                  slug: router.params[slugKey],  // wondering - is there a better way than params to know what slug we're on?
                  id: variables[`id${varIndex}`],
                  memberSlug: variables[`slug${varIndex}`],
                  memberDimension: variables[`dimension${varIndex}`],
                  memberHierarchy: variables[`hierarchy${varIndex}`],
                  name: variables[`name${varIndex}`],
                  // Copy the other object's ranking and apply it to this one, so the sort below can use [0] no matter the order
                  ranking: thisResult[clickedIndex].ranking
                };
                return thisResult;
              }
            });
            dimensionResults = dimensionResults.concat(scaffoldedResults);
          });
          dimensionResults.sort((a, b) => b[0].ranking - a[0].ranking);
        }
        catch (e) {
          console.log("Search Error!");
        }
      }
    }
    return Object.assign({}, resp, {data: {grouped: dimensionResults}});
  }

  spanifyTitle(title) {
    const {profile} = this.props;
    const {variables} = profile;
    // stories don't have variables
    if (!variables) return title;
    const {name1, name2} = variables;
    if (title) {
      return title
        .replace(name1, `<span class="cp-hero-heading-dimension" onClick=titleClick(0)>${name1}</span>`)
        .replace(name2, `<span class="cp-hero-heading-dimension" onClick=titleClick(1)>${name2}</span>`);
    }
    else {
      return title;
    }
  }

  render() {
    const {contents, loading, sources, profile} = this.props;
    const {images, creditsVisible, clickedIndex} = this.state;
    const {searchProps} = this.context;

    let title = this.spanifyTitle(profile.title);
    let paragraphs, sourceContent, statContent, subtitleContent;

    if (contents) {
      title = this.spanifyTitle(contents.title);
      // subtitles
      if (contents.subtitles.length) {
        subtitleContent = contents.subtitles.map((subhead, i) =>
          <Parse className="cp-section-subhead display cp-hero-subhead" key={`${subhead.subtitle}-subhead-${i}`}>
            {subhead.subtitle}
          </Parse>
        );
      }

      // stats
      if (contents.stats.length > 0) {
        const statGroups = nest().key(d => d.title).entries(contents.stats);

        statContent = <div className={`cp-stat-group-wrapper cp-hero-stat-group-wrapper${statGroups.length === 1 ? " single-stat" : ""}`}>
          {statGroups.map(({key, values}) => <StatGroup className="cp-hero-stat" key={key} title={key} stats={values} />)}
        </div>;
      }

      // descriptions
      if (contents.descriptions.length) {
        paragraphs = loading
          ? <p>Loading...</p>
          : contents.descriptions.map((content, i) =>
            <Parse className="cp-section-paragraph cp-hero-paragraph" key={`hero-paragraph-${i}`}>
              {content.description}
            </Parse>
          );
      }

      // sources
      sourceContent = <SourceGroup sources={sources} />;
    }

    // heading & subhead(s)
    const heading = <Fragment>
      <div className="cp-hero-heading-wrapper">
        <Parse El="h1" id={contents ? contents.slug : `${stripHTML(profile.title)}-hero`} className="cp-section-heading cp-hero-heading u-font-xxl">
          {title}
        </Parse>
        {subtitleContent}
      </div>
    </Fragment>;


    return (
      <header className="cp-section cp-hero">
        <div className="cp-section-inner cp-hero-inner">
          {/* caption */}
          <div className="cp-section-content cp-hero-caption">
            {heading}
            {statContent}
            {paragraphs}
            {sourceContent}
          </div>

          {/* print the first visualization */}
          {contents && contents.visualizations && contents.visualizations.length
            ? <div className="cp-hero-figure">
              {contents.visualizations.map((visualization, ii) => ii === 0
                ? <Viz
                  section={this}
                  config={visualization}
                  showTitle={false}
                  sectionTitle={title}
                  hideOptions
                  slug={contents.slug}
                  key={ii}
                />
                : ""
              )}
            </div> : ""
          }
        </div>

        {/* display image credits, and images */}
        {images && images.length
          ? <Fragment>
            {/* credits */}
            <div className={`cp-hero-credits ${creditsVisible ? "is-open" : "is-closed"}`}>
              <Button
                className="cp-hero-credits-button"
                onClick={() => this.setState({creditsVisible: !creditsVisible})}
                icon={creditsVisible ? "eye-off" : "eye-open"}
                iconPosition="left"
                fontSize="xxs"
                active={creditsVisible}
              >
                <span className="u-visually-hidden">
                  {creditsVisible ? "view " : "hide "}
                </span>
                image credits
              </Button>

              {creditsVisible
                ? <ul className="cp-hero-credits-list">
                  {images.map((img, i) =>
                    <li className="cp-hero-credits-item" key={img.permalink}>
                      {images.length > 1
                        ? <h2 className="cp-hero-credits-item-heading u-font-md">
                          Image {i + 1}
                        </h2> : ""
                      }

                      {/* author */}
                      {img.author
                        ? <p className="cp-hero-credits-text">
                          Photograph by <span className="cp-hero-credits-name heading">
                            {img.author}
                          </span>
                        </p> : ""
                      }
                      {/* description */}
                      {img.meta ? <p className="cp-hero-credits-text">
                        {img.meta}
                      </p> : ""}
                      {/* flickr link */}
                      {img.permalink ? <p className="cp-hero-credits-text u-font-xs">
                        <span className="u-visually-hidden">Direct link: </span>
                        <a className="cp-hero-credits-link" href={img.permalink}>
                          {img.permalink.replace("https://", "")}
                        </a>
                      </p> : ""}
                    </li>
                  )}
                </ul> : ""
              }
            </div>

            {/* images */}
            <div className="cp-hero-img-outer">
              <div className="cp-hero-img-overlay" />
              <div className="cp-hero-img-grid">
                {images.map(img => img.src &&
                  <div className="cp-hero-img-wrapper" key={img.src}>
                    <img className="cp-hero-img" src={img.src} alt="" draggable="false" />
                  </div>
                )}
              </div>
            </div>
          </Fragment> : ""
        }
        <Dialog
          className="cp-hero-search"
          isOpen={clickedIndex !== undefined}
          onClose={() => this.setState({clickedIndex: undefined})}
        >
          <ProfileSearch
            inputFontSize="md"
            display="list"
            formatResults={this.formatResults.bind(this)}
            {...searchProps}
          />
        </Dialog>

      </header>
    );
  }
}

Hero.contextTypes = {
  router: PropTypes.object,
  searchProps: PropTypes.object
};

export default connect(state => ({
  locale: state.i18n.locale
}))(hot(Hero));
