import React, {Component} from "react";
import {connect} from "react-redux";
import {withNamespaces} from "react-i18next";
import PropTypes from "prop-types";
import {Link} from "react-router";
import axios from "axios";
import "./ProfileSearch.css";
import linkify from "../../utils/linkify";
import stripHTML from "../../utils/formatters/stripHTML";
import groupMeta from "../../utils/groupMeta";
import {Icon, NonIdealState, Spinner} from "@blueprintjs/core";
import {uuid} from "d3plus-common";
import {group, max, merge, min} from "d3-array";
import {select} from "d3-selection";
import {unique} from "d3plus-common";
import styles from "style.yml";
import ProfileColumns from "./ProfileColumns";
import ProfileTile from "./ProfileTile";

/** used for up/down arrow movement */
function findSibling(elem, dir = "next") {

  let node = elem.parentNode;
  while (node.tagName.toLowerCase() !== "li") node = node.parentNode;

  let sibling = node[`${dir}Sibling`];

  if (!sibling) {
    const list = node.parentNode.parentNode;
    if (list.tagName.toLowerCase() === "li") {
      const column = list[`${dir}Sibling`];
      const items = select(column).selectAll("li");
      sibling = dir === "next" ? select(column).select("li").node()
        : items.nodes()[items.size() - 1];
    }
  }

  return sibling ? select(sibling).select("a").node() : sibling;
}

/** used for left/right arrow movement */
function findNeighbor(elem, dir = "next") {

  let node = elem.parentNode;
  while (node.tagName.toLowerCase() !== "li") node = node.parentNode;
  const nodeBounds = node.getBoundingClientRect();
  const columnX = nodeBounds.left;
  const nodeY = nodeBounds.top;
  const list = node.parentNode.parentNode;
  let nextColumns = Array.from(select(list).selectAll("li").nodes())
    .filter(d => dir === "next" ? d.getBoundingClientRect().left > columnX : d.getBoundingClientRect().left < columnX);
  if (dir === "previous") nextColumns = nextColumns.reverse();
  let sibling = nextColumns.find((d, i) => d.getBoundingClientRect().top === nodeY || i === nextColumns.length - 1);

  if (!sibling) {
    const column = list[`${dir}Sibling`];
    nextColumns = Array.from(select(column).selectAll("li").nodes())
      .filter(d => dir === "next" ? d.getBoundingClientRect().left > columnX : d.getBoundingClientRect().left < columnX);
    if (dir === "previous") nextColumns = nextColumns.reverse();
    sibling = nextColumns.find(d => d.getBoundingClientRect().top === nodeY);
    if (!sibling && nextColumns.length) sibling = nextColumns[dir === "previous" ? 0 : nextColumns.length - 1];
  }

  return sibling ? select(sibling).select("a").node() : sibling;
}

class ProfileSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      filterCubes: props.defaultCubes,
      filterProfiles: props.defaultProfiles,
      filterLevels: props.defaultLevels,
      id: uuid(),
      // Build ignored terms regex just once, only if something is passed, default []
      ignoredTermsRegex: props.ignoredTerms && props.ignoredTerms.length > 0 ? new RegExp(`\\b(${props.ignoredTerms.join("|")})\\b`, "ig") : false,
      loading: false,
      profiles: false,
      query: props.defaultQuery,
      results: false,
      timeout: 0
    };
  }

  componentDidMount() {

    const {id} = this.state;
    const {showExamples} = this.props;

    // passes any query args to the default filter values stored in state
    const {query} = this.context.router.location;
    const queryArgs = {};
    if (query.profiles) queryArgs.filterProfiles = query.profiles;
    if (query.levels) queryArgs.filterLevels = query.levels;
    if (query.cubes) queryArgs.filterCubes = query.cubes;

    if (Object.keys(queryArgs).length) this.setState(queryArgs, showExamples ? this.onChange.bind(this) : undefined);
    else if (showExamples || this.state.query.length) this.onChange.bind(this)();

    select(document).on(`mousedown.${id}`, event => {
      const {active} = this.state;
      const {position} = this.props;
      const container = this.resultContainer;
      if (position === "absolute" && active && container && !container.contains(event.target)) {
        this.onToggle.bind(this)();
      }
    });

    select(document).on(`keydown.${id}`, event => {

      const {router} = this.context;
      const {activeKey, display} = this.props;
      const activeKeyCode = activeKey !== false
        ? typeof activeKey === "string" && activeKey.length === 1
          ? activeKey.toUpperCase().charCodeAt(0)
          : activeKey
        : false;

      const key = event.keyCode;
      const DOWN = 40,
            ENTER = 13,
            ESC = 27,
            LEFT = 37,
            RIGHT = 39,
            UP = 38;

      const arrowKeys = display === "columns" ? [LEFT, UP, RIGHT, DOWN] : [UP, DOWN];
      const linkHighlighted = this.resultContainer && this.resultContainer.contains(event.target);
      const tagName = event.target.tagName.toLowerCase();

      if (activeKeyCode !== false && key === activeKeyCode && !["input", "textarea"].includes(tagName)) {
        event.preventDefault();
        this.onToggle.bind(this)();
      }
      else if (key === ESC && event.target === this.textInput) {
        event.preventDefault();
        this.onToggle.bind(this)();
      }
      else if (key === DOWN && event.target === this.textInput) {
        event.preventDefault();
        const firstLink = select(this.resultContainer).select("a");
        if (firstLink.size()) firstLink.node().focus();
      }
      else if (arrowKeys.includes(key) && linkHighlighted) {

        event.preventDefault();

        if (key === DOWN) {
          const nextLink = findSibling(event.target, "next");
          if (nextLink) this.scrollToLink.bind(this)(nextLink);
        }
        else if (key === UP) {
          const previousLink = findSibling(event.target, "previous");
          if (previousLink) this.scrollToLink.bind(this)(previousLink);
          else this.textInput.focus();
        }
        else if (key === RIGHT) {
          const nextLink = findNeighbor(event.target, "next");
          if (nextLink) this.scrollToLink.bind(this)(nextLink);
        }
        else if (key === LEFT) {
          const previousLink = findNeighbor(event.target, "previous");
          if (previousLink) this.scrollToLink.bind(this)(previousLink);
        }

      }
      else if (key === ENTER && linkHighlighted) {
        const url = event.target.getAttribute("href");
        if (url) router.push(url);
      }

    }, false);

    axios.get("/api/cms/profiles")
      .then(resp => resp.data.filter(p => p.visible))
      .then(profiles => this.setState({profiles}))
      .catch(() => {});

  }

  scrollToLink(elem) {
    const {display} = this.props;
    const topOffset = display === "columns" ? parseFloat(styles["nav-height"], 10) : 0;
    elem.scrollIntoView({block: "nearest"});
    const top = elem.getBoundingClientRect().top - this.resultContainer.getBoundingClientRect().top;
    if (topOffset && top < topOffset) this.resultContainer.scrollTop -= topOffset - top;
    elem.focus();
  }

  onChange(e) {

    const {filterCubes, filterLevels, filterProfiles, ignoredTermsRegex, timeout} = this.state;
    const {filterQueryArgs, limit, minQueryLength, showExamples, formatResults, locale, showLaterals} = this.props;

    let query = e ? e.target.value : this.state.query;
    if (query.length < minQueryLength) query = "";

    // Filter ignored terms from user string
    let filteredQuery = query.trim();
    if (ignoredTermsRegex && filteredQuery !== "") {
      filteredQuery = filteredQuery.replace(ignoredTermsRegex, "");
    }

    // Remove multiples spaces with just one -caused by the ignore terms regex and trim it
    filteredQuery = filteredQuery.replace(/\s\s+/g, " ").trim();

    clearTimeout(timeout);

    // sets new query args on any filter change, before pinging the search API
    if (filterQueryArgs) {
      const {router} = this.context;
      const {basename, pathname} = router.location;
      const newQuery = {};
      newQuery.profiles = filterProfiles || "";
      if (filterCubes) newQuery.cubes = filterCubes;
      if (filterLevels) newQuery.levels = filterLevels;
      const queryString = Object.entries(newQuery).map(([key, val]) => `${key}=${val}`).join("&");
      const newPath = `${basename}${pathname}?${queryString}`;
      router.replace(newPath);
    }

    if (!showExamples && !query.length) {
      this.setState({results: false, query});
    }
    else {

      let url = `/api/profilesearch?query=${filteredQuery}&limit=${limit}&locale=${locale}`;
      if (filterProfiles) url += `&profile=${filterProfiles}`;
      if (filterLevels) url += `&hierarchy=${filterLevels}`;
      if (filterCubes) url += `&cubeName=${filterCubes}`;
      if (showLaterals) url += "&showLaterals=true";

      // handle the query
      this.setState({
        loading: url,
        // set query separately to avoid input lag
        query,
        results: false,
        // make the request on a timeout
        timeout: setTimeout(() => {

          axios.get(url)
            .then(resp => url === this.state.loading ? formatResults(resp) : false)
            .then(resp => {
              if (resp) this.setState({results: resp.data, loading: false});
            })
            .catch(() => {});

        }, 1000)
      });
    }
  }

  resetSearch() {
    this.setState({
      filterProfiles: false,
      query: ""
    },
    this.onFilterLevel.bind(this, false));
  }

  onFocus() {
    this.setState({active: true});
  }

  onToggle() {

    const {active} = this.state;
    this.textInput[active ? "blur" : "focus"]();
    this.setState({active: !active});

  }

  onFilterLevel(filter) {
    const newFilters = filter ? filter.split(",") : [false];
    const {filterCubes, filterLevels, filterProfiles, profiles} = this.state;
    const {filterDimensionTitle} = this.props;
    let newCubes = [];
    let newLevels = [];
    const profileIds = filterProfiles ? filterProfiles.split(",").map(Number) : [];
    const cubeNames = filterCubes ? filterCubes.split(",") : [];
    const levelNames = filterLevels ? filterLevels.split(",") : [];
    const activeMetas = merge(profiles
      .filter(p => profileIds.includes(p.id))
      .map(p => p.meta));
    const hierarchyGroups = Array.from(group(activeMetas, d => filterDimensionTitle(d.dimension)), arr => [unique(merge(arr[1].map(a => a.levels))), unique(arr[1].map(a => a.cubeName))]);
    hierarchyGroups.forEach(([l, c]) => {
      newFilters.forEach(level => {
        if (c.length > 1) {
          const currCubes = c.find(x => cubeNames.includes(x));
          if (c.includes(level)) newCubes.push(level);
          else if (level && currCubes) newCubes.push(currCubes);
          else newCubes = newCubes.concat(c);
        }
        else {
          const currFilter = l.find(x => levelNames.includes(x));
          if (l.includes(level)) newLevels.push(level);
          else if (level && currFilter) newLevels.push(currFilter);
          else newLevels = newLevels.concat(l);
        }
      });
    });
    this.setState({
      filterCubes: unique(newCubes).join(","),
      filterLevels: unique(newLevels).join(",")
    }, this.onChange.bind(this));
  }

  render() {

    const {router} = this.context;
    const {active, filterCubes, filterLevels, filterProfiles, loading, profiles, query, results} = this.state;
    const {locale, placeholder} = this.props;
    const {
      availableProfiles,
      columnTitles,
      display,
      columnOrder,
      filters,
      filterCubeTitle,
      filterDimensionTitle,
      filterHierarchyTitle,
      filterProfileTitle,
      inputFontSize,
      joiner,
      position,
      renderListItem,
      renderTile,
      subtitleFormat,
      titleFormat,
      t
    } = this.props;

    let profileGroups = [];
    if (profiles && filters) {
      const filteredProfiles = (profiles || [])
        .filter(d => !availableProfiles.length || availableProfiles.includes(d.meta[0].slug));
      profileGroups = Array.from(group(filteredProfiles, d => filterProfileTitle(d.content, d.meta)))
        .sort((a, b) => min(a[1], d => d.ordering) - min(b[1], d => d.ordering));
    }
    const activeProfile = profileGroups.find(g => g[1].map(p => p.id).join(",") === filterProfiles);
    let activeDimensions;
    if (activeProfile) {
      const groupedDimensions = group(merge(activeProfile[1].map(p => p.meta)), d => filterDimensionTitle(d.dimension, activeProfile[0]));
      const dimensions = Array.from(groupedDimensions, ([key, value]) => {

        const dimensions = unique(value.map(d => d.dimension));
        const sortedCubes = Array.from(group(value.map(d => d.cubeName), d => filterCubeTitle(d, activeProfile[0])), d => unique(d[1]).join(",")).sort((a, b) => filterCubeTitle(a, activeProfile[0]).localeCompare(filterCubeTitle(b, activeProfile[0])));
        const cubes = unique(value.map(d => d.cubeName));
        if (cubes.length > 1) return {dimensions, title: key, cubes, sortedCubes};

        const levelSets = value.map(v => v.levels);
        const levels = unique(merge(levelSets));
        return {dimensions, title: key, levels, sortedLevels: levels.slice().sort((a, b) => max(levelSets, s => s.indexOf(a)) - max(levelSets, s => s.indexOf(b)))};

      });
      activeDimensions = dimensions.filter(d => (d.levels || d.cubes).length > 1);
    }

    return (
      <div className="cms-profilesearch">

        <label key="input" className={`cp-input-label inputFontSize-${inputFontSize}`}>
          {/* accessibility text */}
          <span className="u-visually-hidden" key="slt">
            {t("CMS.Search.Search profiles")}
          </span>

          {/* the input */}
          <input
            className={`cp-input u-font-${inputFontSize}`}
            placeholder={placeholder}
            value={query}
            onChange={this.onChange.bind(this)}
            onFocus={this.onFocus.bind(this)}
            ref={input => this.textInput = input}
            key="sli"
            type="text"
          />

          {/* search icon (keep after input so it can be easily styled input hover/focus) */}
          <Icon className="cms-profilesearch-icon u-font-xxl" icon="search" key="slii" />

          {/* close button */}
          <button
            className={`cms-profilesearch-reset-button ${query ? "is-visible" : "is-hidden"}`}
            tabIndex={query ? 0 : -1}
            onClick={this.resetSearch.bind(this)}
            key="slb"
          >
            <Icon className="cms-profilesearch-reset-button-icon" icon="cross" />
            <span className="cms-profilesearch-reset-button-text">{t("CMS.Search.reset")}</span>
          </button>
        </label>

        { profiles && filters ? <ul className="cms-profilesearch-filters-profiles">
          <li key="filters-all"
            className={`cms-profilesearch-filters-profile${!filterProfiles ? " active" : ""}`}
            onClick={() => this.setState({filterProfiles: false}, this.onFilterLevel.bind(this, false))}
            dangerouslySetInnerHTML={{__html: filterProfileTitle({label: t("CMS.Search.All")})}} />
          { profileGroups.map(g => {
            const profileIds = g[1].map(p => p.id);
            return <li key={`filters-${profileIds.join("-")}`}
              className={`cms-profilesearch-filters-profile${profileIds.join(",") === filterProfiles ? " active" : ""}`}
              onClick={() => this.setState({filterProfiles: profileIds.join(",")}, this.onFilterLevel.bind(this, false))}
              dangerouslySetInnerHTML={{__html: g[0]}} />;
          }) }
        </ul> : null }
        { activeDimensions ? <div className="cms-profilesearch-filters-dimensions">
          { activeDimensions.map(d => <ul key={`filters-dimension-${d.dimensions.join(",").replace(/\s/g, "-")}`} className="cms-profilesearch-filters-levels">
            { d.levels
              ? <li className={`cms-profilesearch-filters-dimension${ filterLevels && filterLevels.includes(d.levels.join(",")) ? " active" : ""}`}
                onClick={this.onFilterLevel.bind(this, false)}
                dangerouslySetInnerHTML={{__html: d.title}} />
              : <li className={`cms-profilesearch-filters-dimension${ filterCubes && filterCubes.includes(d.cubes.join(",")) ? " active" : ""}`}
                onClick={this.onFilterLevel.bind(this, false)}
                dangerouslySetInnerHTML={{__html: d.title}} />}
            {d.sortedLevels
              ? d.sortedLevels.map(l =>
                <li key={`filters-level-${l}`}
                  className={`cms-profilesearch-filters-level${ filterLevels && !filterLevels.includes(d.levels.join(",")) && filterLevels.includes(l) ? " active" : "" }`}
                  onClick={this.onFilterLevel.bind(this, l)}
                  dangerouslySetInnerHTML={{__html: filterHierarchyTitle(l, activeProfile[0])}} />
              )
              : d.sortedCubes.map(l =>
                <li key={`filters-level-${l}`}
                  className={`cms-profilesearch-filters-level${ filterCubes && !filterCubes.includes(d.cubes.join(",")) && filterCubes.includes(l) ? " active" : "" }`}
                  onClick={this.onFilterLevel.bind(this, l)}
                  dangerouslySetInnerHTML={{__html: filterCubeTitle(l.split(",")[0], activeProfile[0])}} />
              )}
          </ul>) }
        </div> : null }

        <div className={`cms-profilesearch-container cms-profilesearch-container-${position}`} key="container" ref={comp => this.resultContainer = comp}>
          {
            (position !== "absolute" || active) && results
              ? (() => {

                if (!results.grouped.length) {
                  return <NonIdealState key="empty" icon="zoom-out" title={t("CMS.Search.No results", {query, interpolation: {escapeValue: false}})} />;
                }

                else {
                  switch (display) {

                    case "grid":

                      const gridProfiles = (results.grouped || [])
                        .filter(d => !availableProfiles.length || availableProfiles.includes(d[0].slug));

                      return (
                        <ul key="grid" className="cms-profilesearch-grid">
                          {gridProfiles.map((data, j) => renderTile(data, j, {joiner, subtitleFormat, titleFormat}))}
                        </ul>
                      );

                    case "columns":
                      const filteredProfiles = Object.keys(results.profiles || {})
                        .reduce((obj, d) => {
                          let arr = results.profiles[d];
                          if (availableProfiles.length) arr = arr.filter(p => availableProfiles.includes(p[0].slug));
                          if (arr.length) obj[d] = arr;
                          return obj;
                        }, {});
                      const columnProfiles = Object.keys(filteredProfiles || {})
                        .sort((a, b) => {
                          const aIndex = columnOrder.includes(a) ? columnOrder.indexOf(a) : columnOrder.length + 1;
                          const bIndex = columnOrder.includes(b) ? columnOrder.indexOf(b) : columnOrder.length + 1;
                          return aIndex - bIndex;
                        })
                        .map(profile => results.profiles[profile] || []);
                      return <ProfileColumns columnFormat={subtitleFormat} columnTitles={columnTitles} joiner={joiner} renderTile={renderTile} tileProps={{joiner, subtitleFormat, titleFormat}} data={columnProfiles} />;

                    default:
                      const listProfiles = (results.grouped || [])
                        .filter(d => !availableProfiles.length || availableProfiles.includes(d[0].slug));
                      return (
                        <ul key="list" className="cms-profilesearch-list">
                          {listProfiles.map((result, j) => renderListItem(
                            result,
                            j,
                            linkify(router, result, locale),
                            result.map(titleFormat).join(joiner),
                            result.map(subtitleFormat).join(joiner)
                          ))}
                        </ul>
                      );
                  }

                }

              })()
              : loading && (position !== "absolute" || active)
                ? <NonIdealState key="loading" icon={<Spinner />} title={t("CMS.Search.Loading")} />
                : position !== "absolute" ? <NonIdealState key="start" icon="search" title={t("CMS.Search.Empty")} /> : null
          }
        </div>
      </div>
    );
  }

}

ProfileSearch.contextTypes = {
  router: PropTypes.object
};

ProfileSearch.defaultProps = {
  activateKey: false,
  availableProfiles: [],
  columnOrder: [],
  columnTitles: {},
  defaultCubes: false,
  defaultProfiles: false,
  defaultLevels: false,
  defaultQuery: "",
  display: "list",
  filters: false,
  filterCubeTitle: d => d,
  filterDimensionTitle: d => d,
  filterHierarchyTitle: d => d,
  filterProfileTitle: (content, meta) => {
    if (content && content.label && content.label !== "New Profile Label") {
      return stripHTML(content.label);
    }
    else if (meta && meta.length) {
      const groupedMeta = groupMeta(meta);
      return groupedMeta.length > 0 ? groupedMeta.map(g => g[0] ? g[0].dimension || g[0].slug : "ERR_META").join(" / ") : "Unnamed";
    }
    else return "Unnamed";
  },
  filterQueryArgs: false,
  formatResults: resp => resp,
  ignoredTerms: [], // By default ignore nothing
  inputFontSize: "xxl",
  joiner: " & ",
  limit: 10,
  minQueryLength: 1,
  placeholder: "Search...",
  position: "static",
  renderListItem(result, i, link, title, subtitle) {
    return <li key={`r-${i}`} className="cms-profilesearch-list-item">
      <Link to={link} className="cms-profilesearch-list-item-link">
        {title}
        <div className="cms-profilesearch-list-item-sub u-font-xs">{subtitle}</div>
      </Link>
    </li>;
  },
  renderTile(result, i, tileProps) {
    return <ProfileTile key={`r-${i}`} {...tileProps} data={result} />;
  },
  showExamples: false,
  subtitleFormat: d => d.memberHierarchy,
  titleFormat: d => d.name
};

ProfileSearch = withNamespaces()(ProfileSearch);

export default connect(state => ({
  locale: state.i18n.locale
}))(ProfileSearch);
